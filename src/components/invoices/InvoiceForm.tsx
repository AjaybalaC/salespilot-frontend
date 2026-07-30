"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { invoiceApi } from "@/lib/quotation-invoice.api";
import { customerApi } from "@/lib/customer.api";
import { leadApi } from "@/lib/lead.api";
import { InvoiceFormData, LineItemForm } from "@/types/quotation-invoice.types";
import LineItemsEditor from "@/components/shared/LineItemsEditor";
import {
  calculateSummary,
  formatCurrency,
  EMPTY_LINE_ITEM,
} from "@/constants/quotation-invoice.constants";

const EMPTY_FORM: InvoiceFormData = {
  customer: "",
  quotation: "",
  lead: "",
  items: [{ ...EMPTY_LINE_ITEM }],
  dueDate: "",
  notes: "",
  terms: "",
};

interface Props {
  initialData?: Partial<InvoiceFormData>;
  invoiceId?: string;
  mode: "create" | "edit";
  prefillCustomerId?: string;
  prefillLeadId?: string;
}

export default function InvoiceForm({
  initialData,
  invoiceId,
  mode,
  prefillCustomerId,
  prefillLeadId,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<InvoiceFormData>({
    ...EMPTY_FORM,
    ...initialData,
    customer: prefillCustomerId || initialData?.customer || "",
    lead: prefillLeadId || initialData?.lead || "",
    items: initialData?.items || [{ ...EMPTY_LINE_ITEM }],
  });
  const [customers, setCustomers] = useState<{ _id: string; name: string; company?: string }[]>([]);
  const [leads, setLeads] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof InvoiceFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    Promise.all([
      customerApi.getAll({ limit: 100 }),
      leadApi.getAll({ limit: 100 }),
    ]).then(([customersRes, leadsRes]) => {
      setCustomers(customersRes.customers);
      setLeads(leadsRes.leads);
    });
  }, []);

  const summary = calculateSummary(form.items);

  const handleSubmit = async () => {
    setError("");
    if (!form.customer || !form.dueDate || form.items.some((i) => !i.description || !i.unitPrice)) {
      setError("Customer, due date and all item descriptions/prices are required.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "create") {
        await invoiceApi.create(form);
      } else if (invoiceId) {
        await invoiceApi.update(invoiceId, form);
      }
      router.push("/invoices");
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">
              {mode === "create" ? "New Invoice" : "Edit Invoice"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "create" ? "Create a new invoice for your customer" : "Update invoice details"}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Section 1 — Customer & Lead */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 text-sm font-medium">Customer *</label>
              <select value={form.customer} onChange={(e) => set("customer", e.target.value)} className={selectClass}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-sm font-medium">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-sm font-medium">Related Lead</label>
              <select value={form.lead} onChange={(e) => set("lead", e.target.value)} className={selectClass}>
                <option value="">None</option>
                {leads.map((l) => (<option key={l._id} value={l._id}>{l.title}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-sm font-medium">Quotation Reference</label>
              <input
                type="text"
                value={form.quotation}
                onChange={(e) => set("quotation", e.target.value)}
                placeholder="Quotation ID (optional)"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Line Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Line Items</h2>
          <LineItemsEditor
            items={form.items}
            onChange={(items) => setForm((prev) => ({ ...prev, items }))}
          />

          {/* Summary */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                {[
                  { label: "Subtotal", value: summary.subTotal, color: "text-slate-300" },
                  { label: "Discount", value: -summary.totalDiscount, color: "text-red-400" },
                  { label: "Tax", value: summary.totalTax, color: "text-amber-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">{row.label}</span>
                    <span className={`text-sm ${row.color}`}>
                      {row.value < 0 ? "-" : ""}{formatCurrency(Math.abs(row.value))}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-700 pt-2">
                  <span className="text-white font-semibold">Grand Total</span>
                  <span className="text-emerald-400 text-lg font-bold">{formatCurrency(summary.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 — Notes & Terms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Notes & Terms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 text-sm font-medium">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any notes for the customer..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-sm font-medium">Terms & Conditions</label>
              <textarea
                value={form.terms}
                onChange={(e) => set("terms", e.target.value)}
                placeholder="Payment terms, conditions..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : mode === "create" ? "Create Invoice" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}