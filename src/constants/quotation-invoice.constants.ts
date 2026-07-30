import { QuotationStatus, InvoiceStatus, LineItemForm } from "@/types/quotation-invoice.types";

export const QUOTATION_STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  draft: {
    label: "Draft",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
  sent: {
    label: "Sent",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  approved: {
    label: "Approved",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  expired: {
    label: "Expired",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
};

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  paid: {
    label: "Paid",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  overdue: {
    label: "Overdue",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
};

export const EMPTY_LINE_ITEM: LineItemForm = {
  description: "",
  quantity: "1",
  unitPrice: "",
  discount: "0",
  tax: "18",
};

export const calculateItemTotal = (item: LineItemForm): number => {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discount = Number(item.discount) || 0;
  const tax = Number(item.tax) || 0;
  const base = qty * price;
  const afterDiscount = base - (base * discount) / 100;
  return afterDiscount + (afterDiscount * tax) / 100;
};

export const calculateSummary = (items: LineItemForm[]) => {
  let subTotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;
    const base = qty * price;
    const discountAmt = (base * discount) / 100;
    const afterDiscount = base - discountAmt;
    const taxAmt = (afterDiscount * tax) / 100;
    subTotal += base;
    totalDiscount += discountAmt;
    totalTax += taxAmt;
  });

  return {
    subTotal,
    totalDiscount,
    totalTax,
    grandTotal: subTotal - totalDiscount + totalTax,
  };
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};