"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { invoiceApi } from "@/lib/quotation-invoice.api";
import { Invoice, MarkPaidFormData } from "@/types/quotation-invoice.types";
import {
  INVOICE_STATUS_CONFIG,
  formatCurrency,
  formatDate,
} from "@/constants/quotation-invoice.constants";

interface Props {
  invoiceId: string;
}

export default function InvoiceDetail({ invoiceId }: Props) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [markPaidModal, setMarkPaidModal] = useState(false);
  const [paidForm, setPaidForm] = useState<MarkPaidFormData>({ paymentMethod: "", paymentReference: "", paidAt: "" });
  const [markingPaid, setMarkingPaid] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    invoiceApi.getById(invoiceId).then(setInvoice).catch(() => showToast("error", "Failed to load invoice")).finally(() => setLoading(false));
  }, [invoiceId]);

  const handleMarkPaid = async () => {
    if (!paidForm.paymentMethod) return;
    setMarkingPaid(true);
    try {
      const updated = await invoiceApi.markPaid(invoiceId, paidForm);
      setInvoice(updated);
      setMarkPaidModal(false);
      showToast("success", "Invoice marked as paid");
    } catch {
      showToast("error", "Failed to mark invoice as paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await invoiceApi.delete(invoiceId);
      router.push("/invoices");
    } catch {
      showToast("error", "Failed to delete invoice");
      setDeleting(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-slate-400">Invoice not found</p>
        <Link href="/invoices" className="text-indigo-400 text-sm hover:text-indigo-300">Back to invoices →</Link>
      </div>
    </div>
  );

  const statusCfg = INVOICE_STATUS_CONFIG[invoice.status];
  const inputClass = "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all";

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Mark Paid Modal */}
      {markPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-semibold">Mark as Paid</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium">Payment Method *</label>
                <select value={paidForm.paymentMethod} onChange={(e) => setPaidForm((p) => ({ ...p, paymentMethod: e.target.value }))} className={inputClass}>
                  <option value="">Select method</option>
                  {["UPI", "Bank Transfer", "Cash", "Cheque", "Card", "Other"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium">Reference / UTR</label>
                <input type="text" value={paidForm.paymentReference} onChange={(e) => setPaidForm((p) => ({ ...p, paymentReference: e.target.value }))} placeholder="Transaction ID" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium">Payment Date</label>
                <input type="date" value={paidForm.paidAt} onChange={(e) => setPaidForm((p) => ({ ...p, paidAt: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMarkPaidModal(false)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleMarkPaid} disabled={markingPaid || !paidForm.paymentMethod} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {markingPaid ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-white font-semibold">Delete invoice?</h3>
              <p className="text-slate-400 text-sm">This cannot be undone.</p>
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

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-white text-xl font-bold font-mono">{invoice.invoiceNumber}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Due {formatDate(invoice.dueDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          {(invoice.status === "pending" || invoice.status === "overdue") && (
            <button
              onClick={() => setMarkPaidModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-400 text-sm hover:bg-emerald-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark as Paid
            </button>
          )}
          <Link href={`/invoices/${invoiceId}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button onClick={() => setDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-800/60 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Invoice info */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Bill To</p>
            <div>
              <p className="text-white font-semibold">{invoice.customer?.name}</p>
              {invoice.customer?.company && <p className="text-slate-400 text-sm">{invoice.customer.company}</p>}
              {invoice.customer?.email && <p className="text-slate-500 text-xs mt-1">{invoice.customer.email}</p>}
              {invoice.customer?.phone && <p className="text-slate-500 text-xs">{invoice.customer.phone}</p>}
              {invoice.customer?.address && <p className="text-slate-500 text-xs mt-1">{invoice.customer.address}</p>}
              {invoice.customer?.gstNumber && <p className="text-slate-500 text-xs">GST: {invoice.customer.gstNumber}</p>}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Payment Details</p>
            {[
              { label: "Invoice Date", value: formatDate(invoice.createdAt) },
              { label: "Due Date", value: formatDate(invoice.dueDate) },
              { label: "Status", value: statusCfg.label },
              invoice.paidAt ? { label: "Paid On", value: formatDate(invoice.paidAt) } : null,
              invoice.paymentMethod ? { label: "Method", value: invoice.paymentMethod } : null,
              invoice.paymentReference ? { label: "Reference", value: invoice.paymentReference } : null,
              invoice.quotation ? { label: "Quotation", value: invoice.quotation.quotationNumber } : null,
            ].filter(Boolean).map((row: any) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">{row.label}</span>
                <span className={`text-xs ${row.label === "Status" ? statusCfg.color : "text-slate-300"}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Created by */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Created By</p>
            <p className="text-slate-300 text-sm">{invoice.createdBy?.name}</p>
            <p className="text-slate-500 text-xs">{invoice.createdBy?.email}</p>
          </div>
        </div>

        {/* Right — Line items */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <p className="text-white font-semibold text-sm">Line Items</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    {["Description", "Qty", "Unit Price", "Disc %", "Tax %", "Total"].map((h) => (
                      <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="px-5 py-3 text-slate-300 text-sm">{item.description}</td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{item.quantity}</td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{item.discount}%</td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{item.tax}%</td>
                      <td className="px-5 py-3 text-emerald-400 text-sm font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-slate-800 flex justify-end">
              <div className="w-64 space-y-2">
                {[
                  { label: "Subtotal", value: invoice.subTotal, color: "text-slate-300" },
                  { label: "Discount", value: invoice.totalDiscount, color: "text-red-400", prefix: "-" },
                  { label: "Tax", value: invoice.totalTax, color: "text-amber-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">{row.label}</span>
                    <span className={`text-sm ${row.color}`}>{row.prefix || ""}{formatCurrency(row.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-700 pt-2">
                  <span className="text-white font-semibold">Grand Total</span>
                  <span className="text-emerald-400 text-xl font-bold">{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invoice.notes && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Terms & Conditions</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}