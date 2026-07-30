"use client";

// ── src/components/invoices/InvoiceEditPage.tsx ───────────────────────────────
import { useEffect, useState } from "react";
import InvoiceForm from "./InvoiceForm";
import { invoiceApi } from "@/lib/quotation-invoice.api";
import { InvoiceFormData } from "@/types/quotation-invoice.types";

interface Props {
  invoiceId: string;
}

export default function InvoiceEditPage({ invoiceId }: Props) {
  const [data, setData] = useState<Partial<InvoiceFormData> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    invoiceApi
      .getById(invoiceId)
      .then((inv) => {
        setData({
          customer: inv.customer?._id || "",
          quotation: inv.quotation?._id || "",
          lead: inv.lead?._id || "",
          items: inv.items.map((item) => ({
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
            discount: String(item.discount),
            tax: String(item.tax),
          })),
          dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
          notes: inv.notes || "",
          terms: inv.terms || "",
        });
      })
      .catch(() => setError("Failed to load invoice"));
  }, [invoiceId]);

  if (error) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  return <InvoiceForm mode="edit" invoiceId={invoiceId} initialData={data} />;
}