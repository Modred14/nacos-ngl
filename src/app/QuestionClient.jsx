"use client";

import { useState } from "react";
import Question from "@/components/Question";
import EmptyState from "@/components/EmptyState";
import AnonymousBadge from "@/components/AnonymousBadge";

const ITEMS_PER_PAGE = 5;

export default function QuestionClient({ questions }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  const paginated = questions.slice(start, end);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900">
            Open Questions
          </h2>
          <p className="text-surface-500 mt-1 text-sm">
            {questions.length} total questions
          </p>
        </div>
        <AnonymousBadge />{" "}
        <div className="flex justify-end ">
        <a
          href="/admin"
          className="px-4 w-fit py-2 text-sm font-medium rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 transition"
        >
          Admin Panel
        </a></div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {paginated.map((q, i) => (
            <Question key={q.id} question={q} index={i} />
          ))}
        </div>
      )}

      {/* Pagination UI */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                p === page ? "bg-surface-900 text-white" : "hover:bg-surface-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </section>
  );
}
