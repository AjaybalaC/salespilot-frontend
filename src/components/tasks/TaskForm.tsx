"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { taskApi } from "@/lib/followup-task.api";
import { leadApi } from "@/lib/lead.api";
import { customerApi } from "@/lib/customer.api";
import { TaskFormData } from "@/types/followup-task.types";
import { getCurrentUserId } from "@/lib/customer.api";

const EMPTY_FORM: TaskFormData = {
  title: "",
  description: "",
  type: "",
  priority: "",
  assignedTo: "",
  lead: "",
  customer: "",
  dueDate: "",
};

interface Props {
  initialData?: Partial<TaskFormData>;
  taskId?: string;
  mode: "create" | "edit";
  prefillLeadId?: string;
}

export default function TaskForm({ initialData, taskId, mode, prefillLeadId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<TaskFormData>({
    ...EMPTY_FORM,
    ...initialData,
    lead: prefillLeadId || initialData?.lead || "",
  });
  const [leads, setLeads] = useState<{ _id: string; title: string }[]>([]);
  const [customers, setCustomers] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof TaskFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    Promise.all([
      leadApi.getAll({ limit: 100 }),
      customerApi.getAll({ limit: 100 }),
      getCurrentUserId(),
    ]).then(([leadsRes, customersRes, userId]) => {
      setLeads(leadsRes.leads);
      setCustomers(customersRes.customers);
      if (!form.assignedTo) {
        setForm((prev) => ({ ...prev, assignedTo: userId }));
      }
    });
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.dueDate || !form.assignedTo) {
      setError("Title, due date and assigned user are required.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "create") {
        await taskApi.create(form);
      } else if (taskId) {
        await taskApi.update(taskId, form);
      }
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";
  const selectClass = "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">
              {mode === "create" ? "Create Task" : "Edit Task"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "create" ? "Assign a task to track work" : "Update task details"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Task Title *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Call client to discuss proposal" className={inputClass} />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "sales_call", label: "Sales Call", icon: "📞" },
                { value: "meeting", label: "Meeting", icon: "🤝" },
                { value: "client_visit", label: "Client Visit", icon: "🚗" },
                { value: "documentation", label: "Docs", icon: "📄" },
                { value: "follow_up", label: "Follow Up", icon: "🔁" },
                { value: "other", label: "Other", icon: "📌" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("type", opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    form.type === opt.value
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {[
                { value: "low", label: "Low", color: "text-slate-400", activeBg: "bg-slate-500/10", activeBorder: "border-slate-500/40" },
                { value: "medium", label: "Medium", color: "text-amber-400", activeBg: "bg-amber-500/10", activeBorder: "border-amber-500/40" },
                { value: "high", label: "High", color: "text-red-400", activeBg: "bg-red-500/10", activeBorder: "border-red-500/40" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("priority", opt.value)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.priority === opt.value
                      ? `${opt.activeBg} ${opt.activeBorder} ${opt.color}`
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Due Date *</label>
            <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={inputClass} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Task details..." rows={3} className={`${inputClass} resize-none`} />
          </div>

          {/* Lead */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Related Lead</label>
            <select value={form.lead} onChange={(e) => set("lead", e.target.value)} className={selectClass}>
              <option value="">None</option>
              {leads.map((l) => (<option key={l._id} value={l._id}>{l.title}</option>))}
            </select>
          </div>

          {/* Customer */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-sm font-medium">Related Customer</label>
            <select value={form.customer} onChange={(e) => set("customer", e.target.value)} className={selectClass}>
              <option value="">None</option>
              {customers.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </select>
          </div>

          {/* Assigned To */}
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

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
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
            ) : mode === "create" ? "Create Task" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}