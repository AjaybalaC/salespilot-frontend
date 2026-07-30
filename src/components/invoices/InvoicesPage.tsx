"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { invoiceApi } from "@/lib/quotation-invoice.api";
import { Invoice, InvoiceStatus, MarkPaidFormData } from "@/types/quotation-invoice.types";
import {
  INVOICE_STATUS_CONFIG,
  formatCurrency,
  formatDate,
} from "@/constants/quotation-invoice.constants";

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = INVOICE_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0, overdueRevenue: 0 });
  const [markPaidId, setMarkPaidId] = useState<string | null>(null);
  const [paidForm, setPaidForm] = useState<MarkPaidFormData>({ paymentMethod: "", paymentReference: "", paidAt: "" });
  const [markingPaid, setMarkingPaid] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, summaryRes] = await Promise.all([
        invoiceApi.getAll({ page, limit: 10, status }),
        invoiceApi.getSummary(),
      ]);
      setInvoices(res.invoices);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
      setSummary(summaryRes);
    } catch {
      showToast("error", "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [status]);

  const handleMarkPaid = async () => {
    if (!markPaidId || !paidForm.paymentMethod) return;
    setMarkingPaid(true);
    try {
      await invoiceApi.markPaid(markPaidId, paidForm);
      showToast("success", "Invoice marked as paid");
      setMarkPaidId(null);
      setPaidForm({ paymentMethod: "", paymentReference: "", paidAt: "" });
      fetchData();
    } catch {
      showToast("error", "Failed to mark invoice as paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await invoiceApi.delete(deleteId);
      showToast("success", "Invoice deleted");
      setDeleteId(null);
      fetchData();
    } catch {
      showToast("error", "Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Mark Paid Modal */}
      {markPaidId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Mark Invoice as Paid</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium">Payment Method *</label>
                <select
                  value={paidForm.paymentMethod}
                  onChange={(e) => setPaidForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select method</option>
                  {["UPI", "Bank Transfer", "Cash", "Cheque", "Card", "Other"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium">Payment Reference</label>
                <input
                  type="text"
                  value={paidForm.paymentReference}
                  onChange={(e) => setPaidForm((p) => ({ ...p, paymentReference: e.target.value }))}
                  placeholder="UTR / Transaction ID"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium">Payment Date</label>
                <input
                  type="date"
                  value={paidForm.paidAt}
                  onChange={(e) => setPaidForm((p) => ({ ...p, paidAt: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMarkPaidId(null)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={handleMarkPaid}
                disabled={markingPaid || !paidForm.paymentMethod}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {markingPaid ? "Saving..." : "Confirm Payment"}
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
              <h3 className="text-white font-semibold">Delete invoice?</h3>
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
          <h1 className="text-white text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} invoice{total !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: summary.totalRevenue, color: "text-white", bg: "bg-indigo-500/20", iconColor: "text-indigo-400" },
          { label: "Paid", value: summary.paidRevenue, color: "text-emerald-400", bg: "bg-emerald-500/20", iconColor: "text-emerald-400" },
          { label: "Pending", value: summary.pendingRevenue, color: "text-amber-400", bg: "bg-amber-500/20", iconColor: "text-amber-400" },
          { label: "Overdue", value: summary.overdueRevenue, color: "text-red-400", bg: "bg-red-500/20", iconColor: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs mb-2">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        {(["", "pending", "paid", "overdue", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s === "" ? "All" : INVOICE_STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl">🧾</div>
            <p className="text-slate-400 text-sm">No invoices found</p>
            <Link href="/invoices/new" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">Create your first invoice →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Invoice #", "Customer", "Status", "Amount", "Due Date", ""].map((h) => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3.5 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium font-mono">{invoice.invoiceNumber}</p>
                      {invoice.quotation && (
                        <p className="text-slate-500 text-xs">from {invoice.quotation.quotationNumber}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-sm">{invoice.customer?.name}</p>
                      {invoice.customer?.company && (
                        <p className="text-slate-500 text-xs">{invoice.customer.company}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-semibold">{formatCurrency(invoice.grandTotal)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-sm ${new Date(invoice.dueDate) < new Date() && invoice.status === "pending" ? "text-red-400" : "text-slate-400"}`}>
                        {formatDate(invoice.dueDate)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <Link href={`/invoices/${invoice._id}`} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {(invoice.status === "pending" || invoice.status === "overdue") && (
                          <button
                            onClick={() => setMarkPaidId(invoice._id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Mark Paid"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <Link href={`/invoices/${invoice._id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => setDeleteId(invoice._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
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