import {
  FollowUp,
  FollowUpListResponse,
  FollowUpFormData,
  CompleteFollowUpData,
  Task,
  TaskListResponse,
  TaskFormData,
  KanbanData,
} from "@/types/followup-task.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ── Follow-up API ─────────────────────────────────────────────────────────────

export const followUpApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    assignedTo?: string;
    leadId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<FollowUpListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.type) query.set("type", params.type);
    if (params.assignedTo) query.set("assignedTo", params.assignedTo);
    if (params.leadId) query.set("leadId", params.leadId);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);

    const res = await fetch(`${BASE_URL}/followups?${query}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<FollowUp> => {
    const res = await fetch(`${BASE_URL}/followups/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.followUp;
  },

  getToday: async (): Promise<FollowUp[]> => {
    const res = await fetch(`${BASE_URL}/followups/today`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.followUps;
  },

  getCalendar: async (month: number, year: number): Promise<FollowUp[]> => {
    const res = await fetch(
      `${BASE_URL}/api/followups/calendar?month=${month}&year=${year}`,
      { headers: getHeaders(), credentials: "include" }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.followUps;
  },

  create: async (payload: FollowUpFormData): Promise<FollowUp> => {
    const res = await fetch(`${BASE_URL}/followups`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.followUp;
  },

  update: async (
    id: string,
    payload: Partial<FollowUpFormData>
  ): Promise<FollowUp> => {
    const res = await fetch(`${BASE_URL}/followups/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.followUp;
  },

  complete: async (
    id: string,
    payload: CompleteFollowUpData
  ): Promise<FollowUp> => {
    const res = await fetch(`${BASE_URL}/followups/${id}/complete`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.followUp;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/followups/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },
};

// ── Task API ──────────────────────────────────────────────────────────────────

export const taskApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
  }): Promise<TaskListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.priority) query.set("priority", params.priority);
    if (params.type) query.set("type", params.type);
    if (params.assignedTo) query.set("assignedTo", params.assignedTo);

    const res = await fetch(`${BASE_URL}/tasks?${query}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.task;
  },

  getKanban: async (): Promise<KanbanData> => {
    const res = await fetch(`${BASE_URL}/tasks/kanban`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.kanban;
  },

  getToday: async (): Promise<Task[]> => {
    const res = await fetch(`${BASE_URL}/tasks/today`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.tasks;
  },

  create: async (payload: TaskFormData): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.task;
  },

  update: async (id: string, payload: Partial<TaskFormData>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.task;
  },

  updateStatus: async (id: string, status: string): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.task;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },
};