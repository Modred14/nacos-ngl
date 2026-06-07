"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Shield,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="bg-white rounded-2xl border border-surface-200 p-8 space-y-4">
        <div className="h-6 bg-surface-200 rounded-lg w-3/4" />
        <div className="h-4 bg-surface-100 rounded-lg w-full" />
        <div className="h-4 bg-surface-100 rounded-lg w-2/3" />
        <div className="h-px bg-surface-100 mt-2" />
        <div className="h-3 bg-surface-100 rounded w-28" />
      </div>
      <div className="bg-white rounded-2xl border border-surface-200 p-8 space-y-4">
        <div className="h-28 bg-surface-100 rounded-xl" />
        <div className="h-10 bg-surface-200 rounded-xl w-44" />
      </div>
    </div>
  );
}

// ─── ResponseItem ─────────────────────────────────────────────────────────────

function ResponseItem({ response }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 border border-surface-100 hover:border-surface-200 transition-colors">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-200 to-surface-300 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lock className="w-3.5 h-3.5 text-surface-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-800 leading-relaxed break-words">
          {response.content}
        </p>
        {response.created_at && (
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-surface-300" />
            <span className="text-xs text-surface-400">
              {timeAgo(response.created_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function QuestionPageClient({ id }) {
  const [question, setQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const MAX_CHARS = 2000;

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/question/${id}`);
      const data = await res.json();
      setQuestion(data.question);
      setResponses(data.responses || []);
    } catch (err) {
      console.error("Failed to load question:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function submitResponse() {
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/question/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setContent("");
      setSuccessMsg("Your response has been submitted.");

      const updated = await res.json();
      setResponses(updated.responses || []);

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg("Something went wrong. Try again.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitResponse();
  }

  const isSuccess = successMsg && !successMsg.toLowerCase().includes("wrong");
  const isError = successMsg && successMsg.toLowerCase().includes("wrong");

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-15 h-15 border-4 border-gray-100 border-t-brand-600 rounded-full animate-spin"></div>

            <p className="text-black font-semibold">
              Loading<span className="loading-dots"></span>
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!question) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-surface-400" />
        </div>
        <h2 className="text-xl font-display font-bold text-surface-900">
          Question not found
        </h2>
        <p className="text-surface-500 mt-2 text-sm">
          This question may have been removed or is no longer active.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to questions
        </Link>
      </div>
    );
  }

  const responseCount = responses.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-800 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        All questions
      </Link>

      {/* ── QUESTION ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 ring-1 ring-brand-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900 leading-tight">
                {question.title}
              </h1>
              {question.description && (
                <p className="text-sm sm:text-base text-surface-600 mt-2.5 leading-relaxed">
                  {question.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-surface-100">
            <span className="flex items-center gap-1.5 text-xs text-surface-400">
              <Users className="w-3.5 h-3.5" />
              {responseCount === 0
                ? "No responses yet — be the first"
                : `${responseCount} anonymous response${responseCount !== 1 ? "s" : ""}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full ml-auto">
              <Shield className="w-3 h-3" />
              Anonymous
            </div>
          </div>
        </div>
      </div>

      {/* ── Anonymity notice ────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-2xl p-4">
        <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-brand-800">
            Your response is completely anonymous
          </p>
          <p className="text-xs text-brand-700 mt-0.5 leading-relaxed">
            No name, email, or IP address is stored. Your identity is fully
            protected.
          </p>
        </div>
      </div>

      {/* ── RESPONSE BOX ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 sm:p-8 space-y-4">
        <label className="block text-sm font-semibold text-surface-900">
          Your response
        </label>

        {/* Feedback message */}
        {successMsg && (
          <div
            className={`flex items-start gap-2.5 text-sm px-4 py-3 rounded-xl border ${
              isSuccess
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-red-700 bg-red-50 border-red-200"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            {successMsg}
          </div>
        )}

        <div className="relative">
          <textarea
            className="textarea text-sm leading-relaxed pb-8 disabled:opacity-60"
            placeholder="Share your thoughts honestly. No one will know it's you…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            maxLength={MAX_CHARS}
            disabled={submitting}
          />
          {/* Char counter */}
          <span
            className={`absolute bottom-3 right-3 text-[11px] font-mono tabular-nums ${
              content.length > MAX_CHARS * 0.9
                ? content.length >= MAX_CHARS
                  ? "text-red-500"
                  : "text-amber-500"
                : "text-surface-300"
            }`}
          >
            {content.length}/{MAX_CHARS}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-surface-400 hidden sm:block">
            <kbd className="px-1.5 py-0.5 bg-surface-100 border border-surface-200 rounded text-[10px] font-mono">
              ⌘ Enter
            </kbd>{" "}
            to submit
          </p>
          <button
            onClick={submitResponse}
            disabled={submitting || !content.trim()}
            className="btn-primary ml-auto shadow-sm shadow-brand-600/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit anonymously
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── RESPONSES ───────────────────────────────────────────────────── */}
    </div>
  );
}
