import {
  Quotation,
  QuotationListResponse,
  QuotationFormData,
  Invoice,
  InvoiceListResponse,
  InvoiceFormData,
  MarkPaidFormData,
  InvoiceSummary,
} from "@/types/quotation-invoice.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ── Quotation API ─────────────────────────────────────────────────────────────

export const quotationApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    customer?: string;
  }): Promise<QuotationListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.customer) query.set("customer", params.customer);

    const res = await fetch(`${BASE_URL}/api/quotations?${query}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<Quotation> => {
    const res = await fetch(`${BASE_URL}/api/quotations/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.quotation;
  },

  create: async (payload: QuotationFormData): Promise<Quotation> => {
    const res = await fetch(`${BASE_URL}/api/quotations`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        items: payload.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.quotation;
  },

  update: async (
    id: string,
    payload: Partial<QuotationFormData>
  ): Promise<Quotation> => {
    const res = await fetch(`${BASE_URL}/api/quotations/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        items: payload.items?.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.quotation;
  },

  updateStatus: async (id: string, status: string): Promise<Quotation> => {
    const res = await fetch(`${BASE_URL}/api/quotations/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.quotation;
  },

  convertToInvoice: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/quotations/${id}/convert`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/quotations/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },
};

// ── Invoice API ───────────────────────────────────────────────────────────────

export const invoiceApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    customer?: string;
  }): Promise<InvoiceListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.customer) query.set("customer", params.customer);

    const res = await fetch(`${BASE_URL}/api/invoices?${query}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const res = await fetch(`${BASE_URL}/api/invoices/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.invoice;
  },

  getSummary: async (): Promise<InvoiceSummary> => {
    const res = await fetch(`${BASE_URL}/api/invoices/summary`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.summary;
  },

  create: async (payload: InvoiceFormData): Promise<Invoice> => {
    const res = await fetch(`${BASE_URL}/api/invoices`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        items: payload.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.invoice;
  },

  update: async (
    id: string,
    payload: Partial<InvoiceFormData>
  ): Promise<Invoice> => {
    const res = await fetch(`${BASE_URL}/api/invoices/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        items: payload.items?.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.invoice;
  },

  markPaid: async (id: string, payload: MarkPaidFormData): Promise<Invoice> => {
    const res = await fetch(`${BASE_URL}/api/invoices/${id}/paid`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.invoice;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/invoices/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },
};