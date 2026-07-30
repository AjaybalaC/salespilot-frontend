// ── Shared ────────────────────────────────────────────────────────────────────

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface LineItemForm {
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  tax: string;
}

// ── Quotation ─────────────────────────────────────────────────────────────────

export type QuotationStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired";

export interface Quotation {
  _id: string;
  quotationNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  lead?: {
    _id: string;
    title: string;
    status: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: QuotationStatus;
  items: LineItem[];
  subTotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  validUntil: string;
  notes?: string;
  terms?: string;
  companyLogo?: string;
  digitalSignature?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationFormData {
  customer: string;
  lead: string;
  items: LineItemForm[];
  validUntil: string;
  notes: string;
  terms: string;
}

export interface QuotationListResponse {
  quotations: Quotation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Invoice ───────────────────────────────────────────────────────────────────

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  quotation?: {
    _id: string;
    quotationNumber: string;
  };
  lead?: {
    _id: string;
    title: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: InvoiceStatus;
  items: LineItem[];
  subTotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  terms?: string;
  companyLogo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  customer: string;
  quotation: string;
  lead: string;
  items: LineItemForm[];
  dueDate: string;
  notes: string;
  terms: string;
}

export interface MarkPaidFormData {
  paymentMethod: string;
  paymentReference: string;
  paidAt: string;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceSummary {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
}