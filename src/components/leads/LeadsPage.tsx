"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { leadApi } from "@/lib/lead.api";
import { Lead, LeadStatus, LeadPriority } from "@/types/lead.types";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatCurrency,
  formatDate,
} from "@/constants/lead.constants";

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: LeadPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadApi.getAll({
        page,
        limit: 10,
        search,
        status,
        priority,
        source,
      });
      setLeads(res.leads);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      showToast("error", "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, source]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [search, status, priority, source]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await leadApi.delete(deleteId);
      showToast("success", "Lead deleted");
      setDeleteId(null);
      fetchLeads();
    } catch {
      showToast("error", "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const wonLeads = leads.filter((l) => l.status === "won").length;
  const totalValue = leads.reduce(
    (sum, l) => sum + (l.expectedDealValue || 0),
    0
  );
  const highPriority = leads.filter((l) => l.priority === "high").length;

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {toast.msg}
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
              <h3 className="text-white font-semibold">Delete lead?</h3>
              <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total} lead{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("pipeline")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === "pipeline"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pipeline
            </button>
          </div>
          <Link
            href="/leads/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Leads",
            value: total,
            accent: "bg-indigo-500/20",
            iconColor: "text-indigo-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
          },
          {
            label: "Won",
            value: wonLeads,
            accent: "bg-emerald-500/20",
            iconColor: "text-emerald-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "Pipeline Value",
            value: formatCurrency(totalValue),
            accent: "bg-violet-500/20",
            iconColor: "text-violet-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "High Priority",
            value: highPriority,
            accent: "bg-red-500/20",
            iconColor: "text-red-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.accent} flex items-center justify-center shrink-0`}>
              <span className={stat.iconColor}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">{stat.label}</p>
              <p className="text-white text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all"
        >
          <option value="">All sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social_media">Social Media</option>
          <option value="email">Email</option>
          <option value="cold_call">Cold Call</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No leads found</p>
              <Link href="/leads/new" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
                Add your first lead →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Lead", "Customer", "Status", "Priority", "Value", "Follow-up", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left text-slate-500 text-xs font-medium px-5 py-3.5 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* Lead title */}
                      <td className="px-5 py-4">
                        <p className="text-white text-sm font-medium">{lead.title}</p>
                        <p className="text-slate-500 text-xs capitalize">{lead.source?.replace("_", " ")}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="text-slate-300 text-sm">{lead.customer?.name}</p>
                        {lead.customer?.company && (
                          <p className="text-slate-500 text-xs">{lead.customer.company}</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <PriorityBadge priority={lead.priority} />
                      </td>

                      {/* Value */}
                      <td className="px-5 py-4">
                        <p className="text-slate-300 text-sm">
                          {formatCurrency(lead.expectedDealValue)}
                        </p>
                      </td>

                      {/* Follow-up */}
                      <td className="px-5 py-4">
                        <p className="text-slate-500 text-xs">
                          {formatDate(lead.nextFollowUpDate)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <Link
                            href={`/leads/${lead._id}`}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/leads/${lead._id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => setDeleteId(lead._id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pipeline View */}
      {view === "pipeline" && <PipelineView />}
    </div>
  );
}

function PipelineView() {
  const [pipeline, setPipeline] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadApi.getPipeline().then((data) => {
      setPipeline(data as any);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const stages: LeadStatus[] = [
    "new", "contacted", "meeting_scheduled",
    "proposal_sent", "negotiation", "won", "lost",
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const cfg = STATUS_CONFIG[stage];
        const stageLeads: Lead[] = pipeline[stage] || [];
        const stageValue = stageLeads.reduce(
          (sum, l) => sum + (l.expectedDealValue || 0), 0
        );
        return (
          <div key={stage} className="min-w-64 flex-shrink-0">
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {stageLeads.length}
                </span>
              </div>
              {stageValue > 0 && (
                <span className="text-slate-500 text-xs">
                  {formatCurrency(stageValue)}
                </span>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-2 p-2 bg-slate-900/50 border border-t-0 border-slate-800 rounded-b-lg min-h-32">
              {stageLeads.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-slate-600 text-xs">No leads</p>
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <Link
                    key={lead._id}
                    href={`/leads/${lead._id}`}
                    className="block p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                  >
                    <p className="text-white text-sm font-medium line-clamp-1">
                      {lead.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {lead.customer?.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <PriorityBadge priority={lead.priority} />
                      {lead.expectedDealValue && (
                        <span className="text-slate-400 text-xs">
                          {formatCurrency(lead.expectedDealValue)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}