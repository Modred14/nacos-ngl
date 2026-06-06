import { Pool } from "pg";

/**
 * =========================
 * DATABASE CONNECTION
 * =========================
 *
 * ECONNRESET fix: the default pool holds idle connections forever.
 * Supabase / Neon / Railway and most hosted Postgres services kill idle
 * connections after 60-300 s, so the pool hands out a dead socket.
 *
 * Fixes applied:
 *  - idleTimeoutMillis   — drop idle connections before the server does
 *  - connectionTimeoutMillis — fail fast instead of hanging 47 s
 *  - max                 — keep the pool small (serverless-friendly)
 *  - keepAlive + keepAliveInitialDelayMillis — send TCP keep-alives
 *  - allowExitOnIdle     — let the process exit cleanly in dev
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000, // close idle connections after 30 s
  connectionTimeoutMillis: 10_000, // error after 10 s instead of hanging
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  allowExitOnIdle: true,
});

// Log pool errors so they don't become unhandled rejections
pool.on("error", (err) => {
  console.error("Postgres pool error:", err.message);
});

function logDbError(context, error) {
  console.error("\n💥 DATABASE ERROR 💥");
  console.error("Context:", context);
  console.error("Message:", error?.message);
  console.error("Code:", error?.code);
  console.error(error);
  console.error("────────────────────────────\n");
}

/**
 * query() wraps pool.query with one automatic retry on connection-reset
 * errors (ECONNRESET, EPIPE, ENOTFOUND, 57P01 AdminShutdown).
 * The second attempt gets a fresh connection from the pool.
 */
const RETRYABLE = new Set(["ECONNRESET", "EPIPE", "ENOTFOUND", "57P01"]);

async function query(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (RETRYABLE.has(err.code)) {
      // One retry with a fresh connection
      return pool.query(sql, params);
    }
    throw err;
  }
}

/**
 * =========================
 * SCHEMA INIT
 * =========================
 * Call once at startup (or let it run on every cold-start — it's idempotent).
 */
export async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id          SERIAL PRIMARY KEY,
      title       TEXT        NOT NULL,
      description TEXT,
      is_active   BOOLEAN     NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS responses (
      id          SERIAL PRIMARY KEY,
      question_id INTEGER     NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      content     TEXT        NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

/**
 * =========================
 * QUESTIONS
 * =========================
 */

export async function getAllQuestions() {
  try {
    const res = await query(`
      SELECT q.*,
        (SELECT COUNT(*) FROM responses r WHERE r.question_id = q.id)::int AS response_count
      FROM questions q
      ORDER BY q.created_at DESC
    `);
    return res.rows ?? [];
  } catch (err) {
    logDbError("getAllQuestions", err);
    return [];
  }
}

export async function getActiveQuestions() {
  try {
    const res = await query(`
      SELECT q.*,
        (SELECT COUNT(*) FROM responses r WHERE r.question_id = q.id)::int AS response_count
      FROM questions q
      WHERE q.is_active = true
      ORDER BY q.created_at DESC
    `);
    return res.rows ?? [];
  } catch (err) {
    logDbError("getActiveQuestions", err);
    return [];
  }
}

export async function getQuestionById(id) {
  try {
    const res = await query(
      `SELECT q.*,
        (SELECT COUNT(*) FROM responses r WHERE r.question_id = q.id)::int AS response_count
       FROM questions q WHERE q.id = $1`,
      [id],
    );
    return res.rows?.[0] ?? null;
  } catch (err) {
    logDbError("getQuestionById", err);
    return null;
  }
}

export async function createQuestion(title, description) {
  try {
    const res = await query(
      `INSERT INTO questions (title, description) VALUES ($1, $2) RETURNING *`,
      [title, description || null],
    );
    return res.rows?.[0] ?? null;
  } catch (err) {
    logDbError("createQuestion", err);
    return null;
  }
}

export async function updateQuestion(id, title, description, is_active) {
  try {
    const res = await query(
      `UPDATE questions
       SET title = $1, description = $2, is_active = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description || null, is_active, id],
    );
    return res.rows?.[0] ?? null;
  } catch (err) {
    logDbError("updateQuestion", err);
    return null;
  }
}

export async function deleteQuestion(id) {
  try {
    await query(`DELETE FROM questions WHERE id = $1`, [id]);
    return true;
  } catch (err) {
    logDbError("deleteQuestion", err);
    return false;
  }
}

/**
 * =========================
 * RESPONSES
 * =========================
 */

export async function getResponsesByQuestion(questionId) {
  try {
    const res = await query(
      `SELECT * FROM responses WHERE question_id = $1 ORDER BY created_at DESC`,
      [questionId],
    );
    return res.rows ?? [];
  } catch (err) {
    logDbError("getResponsesByQuestion", err);
    return [];
  }
}

export async function getAllResponsesGrouped() {
  try {
    // Single query — much safer than N+1 concurrent pool.query() calls
    const res = await query(`
      SELECT
        q.id            AS question_id,
        q.title,
        q.description,
        q.is_active,
        q.created_at    AS question_created_at,
        q.updated_at    AS question_updated_at,
        (SELECT COUNT(*) FROM responses r2 WHERE r2.question_id = q.id)::int AS response_count,
        r.id            AS response_id,
        r.content       AS response_content,
        r.created_at    AS response_created_at
      FROM questions q
      LEFT JOIN responses r ON r.question_id = q.id
      ORDER BY q.created_at DESC, r.created_at DESC
    `);

    // Fold flat rows into grouped structure
    const map = new Map();
    for (const row of res.rows) {
      if (!map.has(row.question_id)) {
        map.set(row.question_id, {
          id: row.question_id,
          title: row.title,
          description: row.description,
          is_active: row.is_active,
          created_at: row.question_created_at,
          updated_at: row.question_updated_at,
          response_count: row.response_count,
          responses: [],
        });
      }
      if (row.response_id) {
        map.get(row.question_id).responses.push({
          id: row.response_id,
          question_id: row.question_id,
          content: row.response_content,
          created_at: row.response_created_at,
        });
      }
    }

    return [...map.values()];
  } catch (err) {
    logDbError("getAllResponsesGrouped", err);
    return [];
  }
}

export async function createResponse(questionId, content) {
  try {
    const res = await query(
      `INSERT INTO responses (question_id, content) VALUES ($1, $2) RETURNING *`,
      [questionId, content],
    );
    return res.rows?.[0] ?? null;
  } catch (err) {
    logDbError("createResponse", err);
    return null;
  }
}

export async function deleteResponse(id) {
  try {
    await query(`DELETE FROM responses WHERE id = $1`, [id]);
    return true;
  } catch (err) {
    logDbError("deleteResponse", err);
    return false;
  }
}

/**
 * =========================
 * STATS
 * =========================
 */

export async function getStats() {
  try {
    // One round-trip instead of four parallel ones that can exhaust the pool
    const res = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM questions)                                          AS total_questions,
        (SELECT COUNT(*)::int FROM questions WHERE is_active = true)                   AS active_questions,
        (SELECT COUNT(*)::int FROM responses)                                          AS total_responses,
        (SELECT COUNT(*)::int FROM responses WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_responses
    `);

    const row = res.rows?.[0] ?? {};
    return {
      totalQuestions: row.total_questions ?? 0,
      activeQuestions: row.active_questions ?? 0,
      totalResponses: row.total_responses ?? 0,
      recentResponses: row.recent_responses ?? 0,
    };
  } catch (err) {
    logDbError("getStats", err);
    return {
      totalQuestions: 0,
      activeQuestions: 0,
      totalResponses: 0,
      recentResponses: 0,
    };
  }
}
