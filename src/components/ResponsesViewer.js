'use client';

import { useState, useTransition, useCallback } from 'react';
import {
  MessageSquare, ChevronDown, ChevronUp, Trash2,
  Inbox, Clock, Search, X, AlertTriangle, Loader2,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const PAGE_SIZE = 10;

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-200 p-6 w-full max-w-sm animate-slide-up">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 text-sm">Delete this response?</h3>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
              This action is permanent and cannot be undone. The anonymous response will be removed immediately.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="w-3.5 h-3.5" /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ResponseItem ─────────────────────────────────────────────────────────────

function ResponseItem({ response, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await onDelete(response.id);
      setConfirm(false);
    });
  }

  return (
    <>
      {confirm && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
          isPending={isPending}
        />
      )}

      <div className={`group flex items-start gap-3 px-4 py-4 rounded-xl border transition-all duration-200 ${
        isPending
          ? 'opacity-40 border-surface-100 bg-surface-50'
          : 'border-surface-100 bg-surface-50 hover:border-surface-200 hover:bg-white'
      }`}>
        {/* Anonymous avatar */}
        <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-surface-500 select-none">A</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-surface-800 leading-relaxed break-words">
            {response.content}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-surface-300" />
            <span className="text-xs text-surface-400">{timeAgo(response.created_at)}</span>
          </div>
        </div>

        {/* Delete button */}
        {/* <button
          onClick={() => setConfirm(true)}
          disabled={isPending}
          title="Delete response"
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 disabled:opacity-30"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button> */}
      </div>
    </>
  );
}

// ─── QuestionPanel ────────────────────────────────────────────────────────────

function QuestionPanel({ group, onDeleteResponse, searchQuery }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Always safe — normalize in case a stale value slips through
  const responses = Array.isArray(group.responses) ? group.responses : [];

  // Filter responses by search
  const q = searchQuery?.toLowerCase() ?? '';
  const filtered = q
    ? responses.filter(r => r.content.toLowerCase().includes(q))
    : responses;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when search changes
  const handleSearch = useCallback(() => setPage(1), []);

  const hasResponses = responses.length > 0;
  const count        = responses.length;

  return (
    <div className="card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-brand-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 truncate">
            {group.title}
          </p>
          {group.description && (
            <p className="text-xs text-surface-400 truncate mt-0.5">{group.description}</p>
          )}
        </div>

        {/* Response badge */}
        <div className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
          count > 0
            ? 'bg-brand-50 text-brand-700'
            : 'bg-surface-100 text-surface-500'
        }`}>
          <MessageSquare className="w-3 h-3" />
          {count}
        </div>

        {/* Inactive badge */}
        {!group.is_active && (
          <span className="flex-shrink-0 text-xs font-medium text-surface-400 bg-surface-100 px-2 py-1 rounded-lg">
            Inactive
          </span>
        )}

        {/* Chevron */}
        <div className="flex-shrink-0 text-surface-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="border-t border-surface-100">
          {!hasResponses ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="w-8 h-8 text-surface-300 mb-2" />
              <p className="text-sm text-surface-400 font-medium">No responses yet</p>
              <p className="text-xs text-surface-300 mt-1">Responses will appear here once submitted</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Search within responses */}
              {responses.length > 4 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search responses…"
                    onChange={e => { handleSearch(); }}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-surface-50 border border-surface-200 rounded-xl text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* Response list */}
              {paginated.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-surface-400">No responses match your search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paginated.map(response => (
                    <ResponseItem
                      key={response.id}
                      response={response}
                      onDelete={onDeleteResponse}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-surface-400">
                    {filtered.length} response{filtered.length !== 1 ? 's' : ''}
                    {searchQuery ? ' found' : ''}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <span className="px-2 text-xs text-surface-500">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ResponsesViewer (main export) ───────────────────────────────────────────

// Normalize a raw value from the server into a safe array of groups,
// each with a guaranteed `responses` array.
function normalize(raw) {
  // If the server wrapped it as { data: [...] } unwrap it
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return list.map(group => ({
    ...group,
    responses: Array.isArray(group.responses) ? group.responses : [],
  }));
}

export default function ResponsesViewer({ initialData }) {
  const [data, setData]          = useState(() => normalize(initialData));
  const [searchQuery, setSearch]  = useState('');
  const [filterEmpty, setFilterEmpty] = useState(false);

  // Delete a response and update local state
  async function handleDeleteResponse(responseId) {
    const res = await fetch('/api/admin/responses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: responseId }),
    });
    if (!res.ok) throw new Error('Failed to delete');

    setData(prev =>
      prev.map(group => {
        const next = group.responses.filter(r => r.id !== responseId);
        return { ...group, responses: next, response_count: next.length };
      })
    );
  }

  // Filter groups by search query and empty toggle
  const filteredData = data.filter(group => {
    if (filterEmpty && group.responses.length === 0) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = group.title.toLowerCase().includes(q);
    const matchDesc  = group.description?.toLowerCase().includes(q);
    const matchResp  = group.responses.some(r => r.content.toLowerCase().includes(q));
    return matchTitle || matchDesc || matchResp;
  });

  const totalResponsesShown = filteredData.reduce((sum, g) => sum + g.responses.length, 0);

  return (
    <section>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
            Anonymous Responses
          </h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {totalResponsesShown} response{totalResponsesShown !== 1 ? 's' : ''} across {filteredData.length} question{filteredData.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search all…"
              className="pl-9 pr-8 py-2 text-xs bg-white border border-surface-200 rounded-xl text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all w-40 sm:w-52"
            />
            {searchQuery && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle: hide empty */}
          <button
            onClick={() => setFilterEmpty(v => !v)}
            className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
              filterEmpty
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            }`}
          >
            Has responses
          </button>
        </div>
      </div>

      {/* Question panels */}
      {filteredData.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-10 h-10 text-surface-300 mb-3" />
          <p className="text-sm font-medium text-surface-500">
            {searchQuery ? 'No questions match your search' : 'No questions yet'}
          </p>
          <p className="text-xs text-surface-400 mt-1">
            {searchQuery ? 'Try a different keyword' : 'Create questions in the section above'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map(group => (
            <QuestionPanel
              key={group.id}
              group={group}
              onDeleteResponse={handleDeleteResponse}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </section>
  );
}