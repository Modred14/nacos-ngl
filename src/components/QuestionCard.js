"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.questions)
      ? raw.questions
      : [];
  return list;
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}


// ─── DeleteModal ──────────────────────────────────────────────────────────────

function DeleteModal({ question, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-200 p-6 w-full max-w-sm">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 text-sm">
              Delete this question?
            </h3>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
              <span className="font-medium text-surface-700">
                "{question.title}"
              </span>{" "}
              and all{" "}
              <span className="font-semibold text-red-600">
                {question.response_count ?? 0} response
                {question.response_count !== 1 ? "s" : ""}
              </span>{" "}
              will be permanently deleted. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CreateForm ───────────────────────────────────────────────────────────────

function CreateForm({ onCreated, onCancel }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const TITLE_MAX = 500;
  const DESC_MAX = 1000;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Question title is required.");
      return;
    }
    if (title.trim().length > TITLE_MAX) {
      setError(`Title must be under ${TITLE_MAX} characters.`);
      return;
    }

    setLoading(true);
    setError("");

    // ── Optimistic: add a temporary placeholder immediately ──────────────────
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      title: title.trim(),
      description: description.trim() || null,
      is_active: true,
      response_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _saving: true, // flag so the row can show a saving state
    };

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      console.log(data);
      onCreated(optimistic);
       onCancel?.();
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    } catch {
      onCreated(null, tempId); // roll back
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 border-t border-surface-100 bg-surface-50 rounded-b-2xl space-y-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-surface-400">
        New Question
      </p>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-surface-600">
          Question <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. What improvements would you like to see in our events?"
            rows={2}
            maxLength={TITLE_MAX}
            disabled={isLoading}
            className="textarea text-sm pr-14 disabled:opacity-60"
          />
          <span
            className={`absolute bottom-2.5 right-3 text-[10px] font-mono ${title.length > TITLE_MAX * 0.9 ? "text-amber-500" : "text-surface-300"}`}
          >
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-surface-600">
          Description{" "}
          <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add context or instructions for respondents…"
            rows={2}
            maxLength={DESC_MAX}
            disabled={isLoading}
            className="textarea text-sm pr-14 disabled:opacity-60"
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-surface-300">
            {description.length}/{DESC_MAX}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 hover:bg-surface-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="btn-primary text-sm px-5 py-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" /> Create Question
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── EditForm ─────────────────────────────────────────────────────────────────

function EditForm({ question, onSaved, onCancel }) {
  const router = useRouter();
  const [title, setTitle] = useState(question.title);
  const [description, setDesc] = useState(question.description || "");
  const [isActive, setIsActive] = useState(!!question.is_active);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const TITLE_MAX = 500;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Question title is required.");
      return;
    }

    setLoading(true);
    setError("");

    // ── Optimistic: close form and show update immediately ────────────────────
    const optimisticUpdate = {
      ...question,
      title: title.trim(),
      description: description.trim() || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
      _saving: true,
    };
    onSaved(optimisticUpdate); // close form + update row right away

    try {
      const res = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: question.id,
          title: title.trim(),
          description: description.trim() || null,
          is_active: isActive,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Revert to the original question on failure
        onSaved(question, true); // second arg = revert signal
        setError(data.error || "Failed to update question.");
        setLoading(false);
        return;
      }

      // Confirm with real server data (clears _saving flag)
      onSaved(data.question);
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    } catch {
      onSaved(question, true);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-brand-50 border border-brand-100 rounded-xl space-y-3 mt-2"
    >
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-medium text-surface-600">
          Question <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            rows={2}
            maxLength={TITLE_MAX}
            disabled={isLoading}
            className="textarea text-sm pr-14 disabled:opacity-60"
          />
          <span
            className={`absolute bottom-2.5 right-3 text-[10px] font-mono ${title.length > TITLE_MAX * 0.9 ? "text-amber-500" : "text-surface-300"}`}
          >
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-surface-600">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          maxLength={1000}
          disabled={isLoading}
          className="textarea text-sm disabled:opacity-60"
        />
      </div>

      <div className="flex items-center justify-between bg-white border border-surface-200 rounded-xl px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-surface-800">
            Visible to public
          </p>
          <p className="text-xs text-surface-400 mt-0.5">
            {isActive
              ? "Respondents can see and answer this question"
              : "Hidden from the public site"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? "bg-brand-600" : "bg-surface-200"}`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 hover:bg-surface-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="btn-primary text-sm px-5 py-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── QuestionRow ──────────────────────────────────────────────────────────────

function QuestionRow({ question, onUpdated, onDeleted }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirm] = useState(false);
  const [deleteLoading, setDeleting] = useState(false);

  // ── Optimistic delete ──────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true);
    onDeleted(question.id); // remove from list immediately

    try {
      const res = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: question.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setTimeout(() => {
        window.location.reload();
      }, 3500);
      // success — row is already gone, nothing to do
    } catch {
      // Rollback: re-insert the question at its original position
      onUpdated(question, true); // true = rollback signal
      setDeleting(false);
      setConfirm(false);
    }
  }

  // ── Optimistic toggle ──────────────────────────────────────────────────────
  async function handleToggleActive() {
    const toggled = {
      ...question,
      is_active: !question.is_active,
      _saving: true,
    };
    onUpdated(toggled); // flip the toggle immediately

    try {
      const res = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: question.id,
          title: question.title,
          description: question.description,
          is_active: !question.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      onUpdated(data.question);
      setTimeout(() => {
        window.location.reload();
      }, 3500); // confirm with server value (clears _saving)
    } catch {
      onUpdated(question); // revert to original
    }
  }

  // ── Optimistic edit save ───────────────────────────────────────────────────
  function handleSaved(updated, revert = false) {
    if (revert) {
      // EditForm is telling us the save failed — re-open it
      setEditing(true);
      onUpdated(question); // revert displayed data
    } else {
      setEditing(false);
      onUpdated(updated);
    }
  }

  const isSaving = !!question._saving;
// console.log(question.created_at);
// console.log(typeof question.created_at);
// console.log(question.created_at instanceof Date);
  return (
    <div
      className={`group border rounded-xl transition-all duration-200 ${
        isSaving
          ? "border-brand-100 bg-brand-50/20 opacity-75"
          : editing
            ? "border-brand-200 bg-brand-50/30"
            : "border-surface-200 bg-white hover:border-surface-300"
      }`}
    >
      {confirmDelete && (
        <DeleteModal
          question={question}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
          isPending={deleteLoading}
        />
      )}

      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        {/* Status dot / saving spinner */}
        <div className="mt-1 flex-shrink-0 w-4 flex items-center justify-center">
          {isSaving ? (
            <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
          ) : (
            <div
              className={`w-2 h-2 rounded-full ${question.is_active ? "bg-emerald-400" : "bg-surface-300"}`}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 leading-snug">
            {question.title}
          </p>
          {question.description && (
            <p className="text-xs text-surface-500 mt-1 leading-relaxed line-clamp-2">
              {question.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-surface-400">
              <MessageSquare className="w-3 h-3" />
              {question.response_count ?? 0} response
              {question.response_count !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-surface-300">·</span>
            <span className="text-xs text-surface-400">
              {timeAgo(question.created_at)}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                question.is_active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-surface-100 text-surface-500"
              }`}
            >
              {question.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleToggleActive}
            disabled={isSaving || editing}
            title={question.is_active ? "Deactivate" : "Activate"}
            className="p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {question.is_active ? (
              <ToggleRight className="w-4 h-4 text-brand-500" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setEditing((v) => !v)}
            disabled={isSaving}
            title={editing ? "Cancel editing" : "Edit question"}
            className={`p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              editing
                ? "bg-brand-100 text-brand-700"
                : "text-surface-400 hover:text-brand-600 hover:bg-brand-50"
            }`}
          >
            {editing ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setConfirm(true)}
            disabled={editing || isSaving}
            title="Delete question"
            className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editing && (
        <EditForm
          question={question}
          onSaved={handleSaved}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ─── QuestionsManager (main export) ──────────────────────────────────────────

export default function QuestionsManager({ initialQuestions }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(() => normalize(initialQuestions));
  const [showCreate, setShowCreate] = useState(false);
  const [showInactive, setShowInactive] = useState(true);

  // Called by CreateForm:
  //   onCreated(optimisticObj)        → add temp row
  //   onCreated(realObj, tempId)      → swap temp row for real one
  //   onCreated(null, tempId)         → remove temp row (rollback)
  function handleCreated(question, tempId) {
    if (tempId && question === null) {
      // Rollback — remove the temp row
      setQuestions((prev) => prev.filter((q) => q.id !== tempId));
      return;
    }
    if (tempId) {
      // Swap temp row with real server row
      setQuestions((prev) => prev.map((q) => (q.id === tempId ? question : q)));
      setShowCreate(false);
      return;
    }
    // Initial optimistic insert at top
    setQuestions((prev) => [question, ...prev]);
    // Don't close the form yet — wait for server confirmation
  }

  // Called by QuestionRow / EditForm:
  //   onUpdated(updatedObj)           → update the row
  //   onUpdated(originalObj, true)    → rollback (re-insert after delete fail)
  function handleUpdated(question, rollback = false) {
    setQuestions((prev) => {
      const exists = prev.some((q) => q.id === question.id);
      if (!exists && rollback) {
        // Re-insert after a failed delete — put it back where it was
        return [...prev, question].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
      }
      return prev.map((q) => (q.id === question.id ? question : q));
    });
  }

  function handleDeleted(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  const active = questions.filter((q) => q.is_active);
  const inactive = questions.filter((q) => !q.is_active);
  const shown = showInactive ? questions : active;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
            Questions
          </h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inactive.length > 0 && (
            <button
              onClick={() => setShowInactive((v) => !v)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                showInactive
                  ? "bg-white text-surface-600 border-surface-200 hover:border-surface-300"
                  : "bg-surface-800 text-white border-surface-800"
              }`}
            >
              {showInactive
                ? "Hide inactive"
                : `Show inactive (${inactive.length})`}
            </button>
          )}

          <button
            onClick={() => setShowCreate((v) => !v)}
            className={`btn-primary text-sm px-4 py-2 ${showCreate ? "bg-surface-700 hover:bg-surface-800" : ""}`}
          >
            {showCreate ? (
              <>
                <X className="w-3.5 h-3.5" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> New Question
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {showCreate && (
          <CreateForm
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        )}

        {shown.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-surface-400" />
            </div>
            <p className="text-sm font-semibold text-surface-600">
              No questions yet
            </p>
            <p className="text-xs text-surface-400 mt-1 max-w-xs">
              Click <span className="font-semibold">New Question</span> above to
              create your first question.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-sm px-5 py-2 mt-5"
            >
              <Plus className="w-3.5 h-3.5" /> Create first question
            </button>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {shown.map((question) => (
              <div key={question.id} className="p-3">
                <QuestionRow
                  question={question}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
