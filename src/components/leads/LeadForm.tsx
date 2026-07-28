"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { leadApi } from "@/lib/lead.api";
import { customerApi } from "@/lib/customer.api";
import { LeadFormData } from "@/types/lead.types";
import { getCurrentUserId } from "@/lib/customer.api";

const EMPTY_FORM: LeadFormData = {
  title: "",
  customer: "",
  source: "",
  priority: "",
  status: "",
  budget: "",
  expectedDealValue: "",
  expectedCloseDate: "",
  assignedTo: "",
  description: "",
  nextFollowUpDate: "",
  lostReason: "",
  tags: "",
};

interface Props {
  initialData?: Partial<LeadFormData>;
  leadId?: string;
  mode: "create" | "edit";
  prefillCustomerId?: string;
}

export default function LeadForm({
  initialData,
  leadId,
  mode,
  prefillCustomerId,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<LeadFormData>({
    ...EMPTY_FORM,
    ...initialData,
    customer: prefillCustomerId || initialData?.customer || "",
  });
  const [customers, setCustomers] = useState<{ _id: string; name: string; company?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "financial" | "extra">("basic");

  const set = (field: keyof LeadFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    // load customers for dropdown
    customerApi.getAll({ limit: 100 }).then((res) => {
      setCustomers(res.customers);
    });

    // auto fill assignedTo
    if (!form.assignedTo) {
      getCurrentUserId().then((id) => {
        setForm((prev) => ({ ...prev, assignedTo: id }));
      });
    }
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.customer || !form.assignedTo) {
      setError("Title, customer and assigned user are required.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "create") {
        await leadApi.create(form);
      } else if (leadId) {
        await leadApi.update(leadId, form);
      }
      router.push("/leads");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "financial", label: "Financial" },
    { id: "extra", label: "Extra Details" },
  ] as const;

  const inputClass =
    "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";

  const selectClass =
    "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
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
            <h1 className="text-white text-xl font-bold">
              {mode === "create" ? "Add Lead" : "Edit Lead"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "create"
                ? "Fill in the details to create a new lead"
                : "Update the lead information"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Lead Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Website Redesign Project"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Customer *</label>
                  <select
                    value={form.customer}
                    onChange={(e) => set("customer", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `— ${c.company}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Source</label>
                    <select
                      value={form.source}
                      onChange={(e) => set("source", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="email">Email</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => set("priority", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="meeting_scheduled">Meeting Scheduled</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {form.status === "lost" && (
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Lost Reason</label>
                    <input
                      type="text"
                      value={form.lostReason}
                      onChange={(e) => set("lostReason", e.target.value)}
                      placeholder="Why was this lead lost?"
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Assigned To</label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-800/30 border border-slate-700/40 rounded-lg text-sm">
                    {form.assignedTo ? (
                      <span className="text-emerald-400 text-xs">✓ Assigned to you</span>
                    ) : (
                      <span className="text-slate-500 text-xs">Loading...</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Financial */}
            {activeTab === "financial" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Budget (₹)</label>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      placeholder="50000"
                      min="0"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-sm font-medium">Expected Deal Value (₹)</label>
                    <input
                      type="number"
                      value={form.expectedDealValue}
                      onChange={(e) => set("expectedDealValue", e.target.value)}
                      placeholder="75000"
                      min="0"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Expected Close Date</label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={(e) => set("expectedCloseDate", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Value indicator */}
                {form.budget && form.expectedDealValue && (
                  <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-lg">
                    <p className="text-slate-400 text-xs mb-2">Deal Analysis</p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Potential profit</span>
                      <span
                        className={`text-sm font-semibold ${
                          Number(form.expectedDealValue) >= Number(form.budget)
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        ₹{(Number(form.expectedDealValue) - Number(form.budget)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extra Details */}
            {activeTab === "extra" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe the lead, client requirements, project scope..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={form.nextFollowUpDate}
                    onChange={(e) => set("nextFollowUpDate", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="e.g. urgent, enterprise, q3 (comma separated)"
                    className={inputClass}
                  />
                  <p className="text-slate-600 text-xs">Separate tags with commas</p>
                </div>

                {form.tags && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {activeTab !== "basic" && (
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "extra" ? "financial" : "basic")
                  }
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
              )}
              {activeTab !== "extra" ? (
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "basic" ? "financial" : "extra")
                  }
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : mode === "create" ? (
                    "Create Lead"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}