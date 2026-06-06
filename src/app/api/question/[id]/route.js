import {
  getQuestionById,
  getResponsesByQuestion,
  createResponse,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params; // ✅ unwrap promise first
  const questionId = Number(id);

  if (Number.isNaN(questionId)) {
    return Response.json({ error: "Invalid question id" }, { status: 400 });
  }

  const question = await getQuestionById(questionId);
  if (!question) {
    return Response.json({ error: "Question not found" }, { status: 404 });
  }

  const responses = await getResponsesByQuestion(questionId);

  return Response.json({ question, responses });
}

export async function POST(req, { params }) {
  const { id } = await params; // ✅ unwrap promise first
  const questionId = Number(id);

  if (Number.isNaN(questionId)) {
    return Response.json({ error: "Invalid question id" }, { status: 400 });
  }

  const body = await req.json();
  const content = body?.content?.trim();

  if (!content) {
    return Response.json({ error: "Response cannot be empty" }, { status: 400 });
  }

  const created = await createResponse(questionId, content);

  return Response.json({ success: true, response: created });
}