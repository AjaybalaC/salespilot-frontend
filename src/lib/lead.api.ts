import {
  Lead,
  LeadListResponse,
  LeadFormData,
  PipelineData,
  Activity,
} from "@/types/lead.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const leadApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    source?: string;
    assignedTo?: string;
  }): Promise<LeadListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.priority) query.set("priority", params.priority);
    if (params.source) query.set("source", params.source);
    if (params.assignedTo) query.set("assignedTo", params.assignedTo);

    const res = await fetch(`${BASE_URL}/leads?${query}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<Lead> => {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.lead;
  },

  getPipeline: async (): Promise<PipelineData> => {
    const res = await fetch(`${BASE_URL}/leads/pipeline`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.pipeline;
  },

  getActivities: async (id: string): Promise<Activity[]> => {
    const res = await fetch(`${BASE_URL}/leads/${id}/activities`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.activities;
  },

  create: async (payload: Partial<LeadFormData>): Promise<Lead> => {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        budget: payload.budget ? Number(payload.budget) : undefined,
        expectedDealValue: payload.expectedDealValue
          ? Number(payload.expectedDealValue)
          : undefined,
        tags: payload.tags
          ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.lead;
  },

  update: async (id: string, payload: Partial<LeadFormData>): Promise<Lead> => {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        ...payload,
        budget: payload.budget ? Number(payload.budget) : undefined,
        expectedDealValue: payload.expectedDealValue
          ? Number(payload.expectedDealValue)
          : undefined,
        tags: payload.tags
          ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.lead;
  },

  updateStatus: async (
    id: string,
    status: string,
    lostReason?: string
  ): Promise<Lead> => {
    const res = await fetch(`${BASE_URL}/leads/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ status, lostReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.lead;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },
};