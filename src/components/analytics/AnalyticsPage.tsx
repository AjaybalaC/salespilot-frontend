"use client";

import { useState, useEffect } from "react";
import { analyticsApi } from "@/lib/analytics.api";
import {
  RevenueAnalytics,
  LeadAnalytics,
  TopCustomer,
  EmployeeSales,
  TaskStats,
} from "@/types/analytics.types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: value >= 100000 ? "compact" : "standard",
  }).format(value);

const PERIOD_OPTIONS = [
  { value: "week", label: "7 Days" },
  { value: "month", label: "30 Days" },
  { value: "quarter", label: "90 Days" },
  { value: "year", label: "1 Year" },
];

const CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7",
  "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6",
];

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  meeting_scheduled: "Meeting",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {children}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="bg-slate-800/40 rounded-xl animate-pulse"
      style={{ height }}
    />
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {currency ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [leads, setLeads] = useState<LeadAnalytics | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [employees, setEmployees] = useState<EmployeeSales[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingOthers, setLoadingOthers] = useState(true);

  useEffect(() => {
    setLoadingRevenue(true);
    setLoadingLeads(true);
    Promise.all([
      analyticsApi.getRevenueAnalytics(period),
      analyticsApi.getLeadAnalytics(period),
    ]).then(([rev, lead]) => {
      setRevenue(rev);
      setLeads(lead);
      setLoadingRevenue(false);
      setLoadingLeads(false);
    });
  }, [period]);

  useEffect(() => {
    setLoadingOthers(true);
    Promise.all([
      analyticsApi.getTopCustomers(5),
      analyticsApi.getSalesByEmployee(),
      analyticsApi.getTaskStats(),
    ]).then(([cust, emp, tasks]) => {
      setTopCustomers(cust);
      setEmployees(emp);
      setTaskStats(tasks);
      setLoadingOthers(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Business insights and performance metrics</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === opt.value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <Section title="Revenue Over Time">
        {loadingRevenue ? (
          <ChartSkeleton height={280} />
        ) : revenue && revenue.monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenue.monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip currency />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-600 text-sm">No revenue data for this period</p>
          </div>
        )}
      </Section>

      {/* Lead trend + Lead by source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead trend */}
        <Section title="Lead Trend">
          {loadingLeads ? (
            <ChartSkeleton height={220} />
          ) : leads && leads.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leads.trend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                <Bar dataKey="total" name="Total" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="won" name="Won" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-slate-600 text-sm">No lead data for this period</p>
            </div>
          )}
        </Section>

        {/* Lead by source */}
        <Section title="Leads by Source">
          {loadingLeads ? (
            <ChartSkeleton height={220} />
          ) : leads && leads.bySource.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={leads.bySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {leads.bySource.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => typeof val === 'number' ? val : val ?? 0} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {leads.bySource.map((item, idx) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="text-slate-400 text-xs capitalize">
                        {item.source?.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-white text-xs font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-slate-600 text-sm">No source data</p>
            </div>
          )}
        </Section>
      </div>

      {/* Lead by status + Revenue by status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead funnel */}
        <Section title="Lead Funnel">
          {loadingLeads ? (
            <ChartSkeleton height={220} />
          ) : leads && leads.byStatus.length > 0 ? (
            <div className="space-y-3">
              {[...leads.byStatus]
                .sort((a, b) => b.count - a.count)
                .map((item, idx) => {
                  const max = Math.max(...leads.byStatus.map((s) => s.count), 1);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{STATUS_LABELS[item.status] || item.status}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300 font-medium">{item.count}</span>
                          {item.totalValue > 0 && (
                            <span className="text-slate-500">{formatCurrency(item.totalValue)}</span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.count / max) * 100}%`,
                            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-slate-600 text-sm">No status data</p>
            </div>
          )}
        </Section>

        {/* Revenue by invoice status */}
        <Section title="Revenue by Invoice Status">
          {loadingRevenue ? (
            <ChartSkeleton height={220} />
          ) : revenue && revenue.byStatus.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={revenue.byStatus}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {revenue.byStatus.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => typeof val === 'number' ? formatCurrency(val) : val} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {revenue.byStatus.map((item, idx) => (
                  <div key={item.status} className="space-y-0.5">
                    <div className="fl<Tooltipex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <span className="text-slate-400 text-xs capitalize">{item.status}</span>
                      </div>
                      <span className="text-white text-xs font-semibold">{formatCurrency(item.total)}</span>
                    </div>
                    <p className="text-slate-600 text-xs pl-4">{item.count} invoices</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-slate-600 text-sm">No invoice data</p>
            </div>
          )}
        </Section>
      </div>

      {/* Task stats */}
      {taskStats && (
        <Section title="Task Completion">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total", value: taskStats.total, color: "text-white" },
              { label: "Completed", value: taskStats.completed, color: "text-emerald-400" },
              { label: "Overdue", value: taskStats.overdue, color: "text-red-400" },
              { label: "Completion Rate", value: `${taskStats.completionRate}%`, color: "text-indigo-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/40 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Completion Progress</span>
              <span className="text-indigo-400">{taskStats.completionRate}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${taskStats.completionRate}%` }}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Top customers */}
      <Section title="Top Customers by Revenue">
        {loadingOthers ? (
          <ChartSkeleton height={200} />
        ) : topCustomers.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-6">No customer revenue data yet</p>
        ) : (
          <div className="space-y-3">
            {topCustomers.map((customer, idx) => {
              const maxRevenue = topCustomers[0]?.totalRevenue || 1;
              return (
                <div key={customer._id} className="flex items-center gap-4">
                  <span className="text-slate-600 text-xs w-4 text-right">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                    {customer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-white text-sm font-medium">{customer.name}</p>
                        {customer.company && (
                          <p className="text-slate-500 text-xs">{customer.company}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-sm font-semibold">
                          {formatCurrency(customer.totalRevenue)}
                        </p>
                        <p className="text-slate-600 text-xs">{customer.invoiceCount} invoices</p>
                      </div>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/60 rounded-full"
                        style={{ width: `${(customer.totalRevenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Sales leaderboard */}
      <Section title="Sales Leaderboard">
        {loadingOthers ? (
          <ChartSkeleton height={200} />
        ) : employees.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-6">No employee data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["#", "Employee", "Total Leads", "Won", "Conversion", "Pipeline Value"].map((h) => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium px-3 py-2.5 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp, idx) => (
                  <tr key={emp._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 py-3">
                      <span className={`text-sm font-bold ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-700" : "text-slate-600"}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm">{emp.name}</p>
                          <p className="text-slate-500 text-xs capitalize">{emp.role?.replace("_", " ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-sm">{emp.totalLeads}</td>
                    <td className="px-3 py-3 text-emerald-400 text-sm font-medium">{emp.wonLeads}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-16">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(emp.conversionRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs">{emp.conversionRate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-sm">{formatCurrency(emp.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}