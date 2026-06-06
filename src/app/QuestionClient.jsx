"use client";

import { useState } from "react";
import Question from "@/components/Question";
import EmptyState from "@/components/EmptyState";
import AnonymousBadge from "@/components/AnonymousBadge";
import { ChevronLeft, ChevronRight, LayoutGrid, Shield } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function QuestionClient({ questions }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const start      = (page - 1) * ITEMS_PER_PAGE;
  const end        = start + ITEMS_PER_PAGE;
  const paginated  = questions.slice(start, end);

  function goTo(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Build compact page window: always show first, last, current ±1
  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = [...set].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
      result.push(sorted[i]);
    }
    return result;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 ring-1 ring-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LayoutGrid className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-surface-900 leading-tight">
              Open Questions
            </h2>
            <p className="text-surface-500 mt-0.5 text-sm">
              {questions.length} question{questions.length !== 1 ? "s" : ""} awaiting your response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <AnonymousBadge />
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-surface-200 bg-white text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-all duration-200 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </a>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-brand-200 via-surface-200 to-transparent mb-8" />

      {/* ── Question list ──────────────────────────────────────────────── */}
      {paginated.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {paginated.map((q, i) => (
            <div
              key={q.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <Question question={q} index={start + i} />
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-100">

          {/* Prev */}
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm font-medium text-surface-700 hover:bg-surface-50 hover:border-surface-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-surface-400 select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`
                    min-w-[36px] h-9 px-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${p === page
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                      : "text-surface-600 hover:bg-surface-100 border border-transparent hover:border-surface-200"
                    }
                  `}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm font-medium text-surface-700 hover:bg-surface-50 hover:border-surface-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page indicator for mobile */}
      {totalPages > 1 && (
        <p className="text-center text-xs text-surface-400 mt-4 sm:hidden">
          Page {page} of {totalPages}
        </p>
      )}
    </section>
  );
}