"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { leadApi } from "@/lib/lead.api";
import { Lead, Activity } from "@/types/lead.types";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatCurrency,
  formatDate,
  PIPELINE_STAGES,
} from "@/constants/lead.constants";
import { LeadStatus } from "@/types/lead.types";

interface Props {
  leadId: string;
}

export default function LeadDetail({ leadId }: Props) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus | "">("");
  const [lostReason, setLostReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [leadData, activityData] = await Promise.all([
          leadApi.getById(leadId),
          leadApi.getActivities(leadId),
        ]);
        setLead(leadData);
        setActivities(activityData);
        setNewStatus(leadData.status);
      } catch {
        showToast("error", "Failed to load lead");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leadId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await leadApi.delete(leadId);
      router.push("/leads");
    } catch {
      showToast("error", "Failed to delete lead");
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const updated = await leadApi.updateStatus(
        leadId,
        newStatus,
        newStatus === "lost" ? lostReason : undefined
      );
      setLead(updated);
      setStatusModal(false);
      showToast("success", "Status updated");
      const updatedActivities = await leadApi.getActivities(leadId);
      setActivities(updatedActivities);
    } catch {
      showToast("error", "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-400">Lead not found</p>
          <Link href="/leads" className="text-indigo-400 text-sm hover:text-indigo-300">
            Back to leads →
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[lead.status];
  const priorityCfg = PRIORITY_CONFIG[lead.priority];
  const currentStageIndex = PIPELINE_STAGES.indexOf(lead.status);

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === "success"
            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-white font-semibold">Delete this lead?</h3>
              <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-semibold">Update Status</h3>
            <div className="space-y-2">
              {PIPELINE_STAGES.map((stage) => {
                const cfg = STATUS_CONFIG[stage];
                return (
                  <button
                    key={stage}
                    onClick={() => setNewStatus(stage)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                      newStatus === stage
                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                        : "border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${newStatus === stage ? cfg.color.replace("text-", "bg-") : "bg-slate-600"}`} />
                    <span className="text-sm">{cfg.label}</span>
                    {newStatus === stage && (
                      <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            {newStatus === "lost" && (
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm">Lost Reason</label>
                <input
                  type="text"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  placeholder="Why was this lead lost?"
                  className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStatusModal(false)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {updatingStatus ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">{lead.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs ${priorityCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                {priorityCfg.label} priority
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/40 text-indigo-400 text-sm hover:bg-indigo-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Update Status
          </button>
          <Link
            href={`/leads/${leadId}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-800/60 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Pipeline Progress</p>
        <div className="flex items-center gap-0">
          {PIPELINE_STAGES.filter((s) => s !== "lost").map((stage, idx) => {
            const cfg = STATUS_CONFIG[stage];
            const isActive = stage === lead.status;
            const isPast = currentStageIndex > idx && lead.status !== "lost";
            const isLast = idx === PIPELINE_STAGES.filter((s) => s !== "lost").length - 1;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive
                        ? `${cfg.bg} ${cfg.border}`
                        : isPast
                        ? "bg-indigo-500 border-indigo-500"
                        : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    {isPast ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${isActive ? cfg.color.replace("text-", "bg-") : "bg-slate-600"}`} />
                    )}
                  </div>
                  <span className={`text-xs text-center leading-tight ${isActive ? cfg.color : isPast ? "text-indigo-400" : "text-slate-600"}`}>
                    {cfg.label.split(" ")[0]}
                  </span>
                </div>
                {!isLast && (
                  <div className={`h-0.5 flex-1 -mt-5 ${isPast ? "bg-indigo-500" : "bg-slate-800"}`} />
                )}
              </div>
            );
          })}
        </div>
        {lead.status === "lost" && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">
              Lead marked as lost{lead.lostReason ? `: ${lead.lostReason}` : ""}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Customer</p>
            <Link
              href={`/customers/${lead.customer?._id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {lead.customer?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{lead.customer?.name}</p>
                {lead.customer?.company && (
                  <p className="text-slate-500 text-xs">{lead.customer.company}</p>
                )}
              </div>
            </Link>
            <p className="text-slate-500 text-xs">{lead.customer?.email}</p>
          </div>

          {/* AI Score */}
          {lead.aiScore !== null && lead.aiScore !== undefined && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">AI Lead Score</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">{lead.aiScore}%</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    lead.aiScore >= 70
                      ? "bg-emerald-500/10 text-emerald-400"
                      : lead.aiScore >= 40
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                  }`}>
                    {lead.aiScore >= 70 ? "High" : lead.aiScore >= 40 ? "Medium" : "Low"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      lead.aiScore >= 70
                        ? "bg-emerald-500"
                        : lead.aiScore >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${lead.aiScore}%` }}
                  />
                </div>
                {lead.aiScoreReason && (
                  <p className="text-slate-500 text-xs">{lead.aiScoreReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Meta info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Details</p>
            {[
              { label: "Source", value: lead.source?.replace("_", " ") },
              { label: "Assigned To", value: lead.assignedTo?.name },
              { label: "Created By", value: lead.createdBy?.name },
              { label: "Created", value: formatDate(lead.createdAt) },
              { label: "Updated", value: formatDate(lead.updatedAt) },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">{label}</span>
                  <span className="text-slate-300 text-xs capitalize">{value}</span>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Financial */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Budget", value: formatCurrency(lead.budget), color: "text-slate-300" },
              { label: "Deal Value", value: formatCurrency(lead.expectedDealValue), color: "text-emerald-400" },
              { label: "Close Date", value: formatDate(lead.expectedCloseDate), color: "text-slate-300" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {lead.description && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Description</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {lead.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {lead.nextFollowUpDate && (
            <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-amber-400 text-sm font-medium">Next Follow-up</p>
              </div>
              <p className="text-white text-sm">{formatDate(lead.nextFollowUpDate)}</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/follow-ups/new?leadId=${leadId}`}
              className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Schedule Follow-up</p>
                <p className="text-slate-500 text-xs">Set a reminder</p>
              </div>
            </Link>
            <Link
              href={`/quotations/new?leadId=${leadId}`}
              className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Create Quotation</p>
                <p className="text-slate-500 text-xs">Send a proposal</p>
              </div>
            </Link>
          </div>

          {/* Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Activity Timeline</p>
            {activities.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4">No activities yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={activity._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      {idx < activities.length - 1 && (
                        <div className="w-px flex-1 bg-slate-800 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-slate-300 text-sm">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 text-xs">
                          {activity.performedBy?.name}
                        </span>
                        <span className="text-slate-700">·</span>
                        <span className="text-slate-500 text-xs">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}