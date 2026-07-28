"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { followUpApi } from "@/lib/followup-task.api";
import { FollowUp, FollowUpStatus, CompleteFollowUpData } from "@/types/followup-task.types";
import {
  FOLLOWUP_STATUS_CONFIG,
  FOLLOWUP_TYPE_CONFIG,
  formatDateTime,
} from "@/constants/followup-task.constants";

function StatusBadge({ status }: { status: FollowUpStatus }) {
  const cfg = FOLLOWUP_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [completeModal, setCompleteModal] = useState<string | null>(null);
  const [completeData, setCompleteData] = useState<CompleteFollowUpData>({ meetingNotes: "", notes: "" });
  const [completing, setCompleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [view, setView] = useState<"list" | "today">("list");

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      if (view === "today") {
        const data = await followUpApi.getToday();
        setFollowUps(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        const res = await followUpApi.getAll({ page, limit: 10, status, type });
        setFollowUps(res.followUps);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch {
      showToast("error", "Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  }, [page, status, type, view]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  useEffect(() => {
    setPage(1);
  }, [status, type, view]);

  const handleComplete = async () => {
    if (!completeModal) return;
    setCompleting(true);
    try {
      await followUpApi.complete(completeModal, completeData);
      showToast("success", "Follow-up marked as completed");
      setCompleteModal(null);
      setCompleteData({ meetingNotes: "", notes: "" });
      fetchFollowUps();
    } catch {
      showToast("error", "Failed to complete follow-up");
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await followUpApi.delete(deleteId);
      showToast("success", "Follow-up deleted");
      setDeleteId(null);
      fetchFollowUps();
    } catch {
      showToast("error", "Failed to delete follow-up");
    } finally {
      setDeleting(false);
    }
  };

  const pending = followUps.filter((f) => f.status === "pending").length;
  const overdue = followUps.filter((f) => f.status === "overdue").length;
  const completed = followUps.filter((f) => f.status === "completed").length;

  const inputClass = "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-semibold">Mark as Completed</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm">Meeting Notes</label>
                <textarea
                  value={completeData.meetingNotes}
                  onChange={(e) => setCompleteData((p) => ({ ...p, meetingNotes: e.target.value }))}
                  placeholder="What was discussed in the meeting?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm">Additional Notes</label>
                <textarea
                  value={completeData.notes}
                  onChange={(e) => setCompleteData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Any other notes..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCompleteModal(null)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleComplete} disabled={completing} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {completing ? "Saving..." : "Mark Complete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-white font-semibold">Delete follow-up?</h3>
              <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} follow-up{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setView("today")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "today" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Today
            </button>
          </div>
          <Link
            href="/follow-ups/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Follow-up
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending, color: "text-amber-400", bg: "bg-amber-500/20" },
          { label: "Overdue", value: overdue, color: "text-red-400", bg: "bg-red-500/20" },
          { label: "Completed", value: completed, color: "text-emerald-400", bg: "bg-emerald-500/20" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      {view === "list" && (
        <div className="flex gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
          >
            <option value="">All statuses</option>
            {Object.entries(FOLLOWUP_STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
          >
            <option value="">All types</option>
            {Object.entries(FOLLOWUP_TYPE_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : followUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl">📅</div>
            <p className="text-slate-400 text-sm">No follow-ups found</p>
            <Link href="/follow-ups/new" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
              Schedule your first follow-up →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {followUps.map((followUp) => {
              const typeCfg = FOLLOWUP_TYPE_CONFIG[followUp.type];
              return (
                <div key={followUp._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors group">
                  {/* Type icon */}
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    {typeCfg.icon}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white text-sm font-medium">{followUp.customer?.name}</p>
                      <span className="text-slate-600">·</span>
                      <p className="text-slate-400 text-xs truncate">{followUp.lead?.title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusBadge status={followUp.status} />
                      <span className="text-slate-500 text-xs">{typeCfg.label}</span>
                      <span className="text-slate-500 text-xs">{formatDateTime(followUp.scheduledAt)}</span>
                    </div>
                    {followUp.notes && (
                      <p className="text-slate-500 text-xs mt-1 truncate">{followUp.notes}</p>
                    )}
                  </div>

                  {/* Assigned to */}
                  <div className="hidden md:block shrink-0">
                    <p className="text-slate-500 text-xs">{followUp.assignedTo?.name}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {followUp.status === "pending" || followUp.status === "overdue" ? (
                      <button
                        onClick={() => setCompleteModal(followUp._id)}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Mark Complete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    ) : null}
                    <Link
                      href={`/follow-ups/${followUp._id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setDeleteId(followUp._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
            <p className="text-slate-500 text-xs">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}