import {
  DashboardSummary,
  RevenueAnalytics,
  LeadAnalytics,
  PipelineSummary,
  TopCustomer,
  EmployeeSales,
  TaskStats,
  RecentActivity,
} from "@/types/analytics.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const analyticsApi = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch(`${BASE_URL}/api/analytics/dashboard`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.summary;
  },

  getRevenueAnalytics: async (period: string): Promise<RevenueAnalytics> => {
    const res = await fetch(
      `${BASE_URL}/api/analytics/revenue?period=${period}`,
      { headers: getHeaders(), credentials: "include" }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.analytics;
  },

  getLeadAnalytics: async (period: string): Promise<LeadAnalytics> => {
    const res = await fetch(
      `${BASE_URL}/api/analytics/leads?period=${period}`,
      { headers: getHeaders(), credentials: "include" }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.analytics;
  },

  getPipelineSummary: async (): Promise<PipelineSummary> => {
    const res = await fetch(`${BASE_URL}/api/analytics/pipeline`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.pipeline;
  },

  getTopCustomers: async (limit = 5): Promise<TopCustomer[]> => {
    const res = await fetch(
      `${BASE_URL}/api/analytics/top-customers?limit=${limit}`,
      { headers: getHeaders(), credentials: "include" }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.customers;
  },

  getSalesByEmployee: async (): Promise<EmployeeSales[]> => {
    const res = await fetch(`${BASE_URL}/api/analytics/employees`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.sales;
  },

  getTaskStats: async (): Promise<TaskStats> => {
    const res = await fetch(`${BASE_URL}/api/analytics/tasks`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.stats;
  },

  getRecentActivities: async (limit = 10): Promise<RecentActivity[]> => {
    const res = await fetch(
      `${BASE_URL}/api/analytics/activities?limit=${limit}`,
      { headers: getHeaders(), credentials: "include" }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data.activities;
  },
};