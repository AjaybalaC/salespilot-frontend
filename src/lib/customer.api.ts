import { CustomerFormData, CustomerListResponse, Customer } from "@/types/customer.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const customerApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
  }): Promise<CustomerListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.industry) query.set("industry", params.industry);

    const res = await fetch(`${BASE_URL}/customers?${query}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const res = await fetch(`${BASE_URL}/customers/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.customer;
  },

  create: async (payload: CustomerFormData): Promise<Customer> => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.customer;
  },

  update: async (id: string, payload: Partial<CustomerFormData>): Promise<Customer> => {
    const res = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.customer;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },

  export: async (): Promise<Customer[]> => {
    const res = await fetch(`${BASE_URL}/customers/export`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.customers;
  },
};