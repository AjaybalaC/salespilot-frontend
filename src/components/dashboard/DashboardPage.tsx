"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { analyticsApi } from "@/lib/analytics.api";
import {
  DashboardSummary,
  RecentActivity,
  PipelineSummary,
} from "@/types/analytics.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: value >= 100000 ? "compact" : "standard",
  }).format(value);

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  growth,
  icon,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  growth?: number;
  icon: React.ReactNode;
  accent: string;
  href?: string;
}) {
  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg ${accent} flex items-center justify-center`}>
          {icon}
        </div>
        {growth !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${growth >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {growth >= 0 ? "+" : ""}{growth}%
          </span>
        )}
      </div>
      <div>
        <p className="text-white text-2xl font-bold">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// ── Alert Card ────────────────────────────────────────────────────────────────

function AlertCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  if (value === 0) return null;
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${color} hover:opacity-80 transition-opacity`}
    >
      <p className="text-sm font-medium">{label}</p>
      <span className="text-lg font-bold">{value}</span>
    </Link>
  );
}

// ── Pipeline Bar ──────────────────────────────────────────────────────────────

function PipelineBar({ pipeline }: { pipeline: PipelineSummary }) {
  const activeStages = pipeline.stages.filter(
    (s) => !["won", "lost"].includes(s.stage) && s.count > 0
  );
  const maxCount = Math.max(...activeStages.map((s) => s.count), 1);

  const stageColors: Record<string, string> = {
    new: "bg-blue-500",
    contacted: "bg-indigo-500",
    meeting_scheduled: "bg-violet-500",
    proposal_sent: "bg-purple-500",
    negotiation: "bg-amber-500",
  };

  const stageLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    meeting_scheduled: "Meeting",
    proposal_sent: "Proposal",
    negotiation: "Negotiation",
  };

  return (
    <div className="space-y-3">
      {pipeline.stages
        .filter((s) => !["won", "lost"].includes(s.stage))
        .map((stage) => (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{stageLabels[stage.stage] || stage.stage}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{stage.count} leads</span>
                {stage.value > 0 && (
                  <span className="text-slate-600">{formatCurrency(stage.value)}</span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${stageColors[stage.stage] || "bg-slate-500"}`}
                style={{ width: `${(stage.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}

// ── Activity Item ─────────────────────────────────────────────────────────────

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const typeIcons: Record<string, string> = {
    lead_created: "🎯",
    lead_updated: "✏️",
    status_changed: "🔄",
    follow_up_scheduled: "📅",
    proposal_sent: "📄",
    customer_created: "👤",
    invoice_generated: "🧾",
    payment_received: "💰",
    note_added: "📝",
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800/60 last:border-0">
      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-sm shrink-0">
        {typeIcons[activity.type] || "⚡"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm">{activity.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-slate-500 text-xs">{activity.performedBy?.name}</span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-600 text-xs">{formatDate(activity.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pipeline, setPipeline] = useState<PipelineSummary | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryData, pipelineData, activitiesData] = await Promise.all([
          analyticsApi.getDashboardSummary(),
          analyticsApi.getPipelineSummary(),
          analyticsApi.getRecentActivities(8),
        ]);
        setSummary(summaryData);
        setPipeline(pipelineData);
        setActivities(activitiesData);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center space-y-3">
          <svg className="w-8 h-8 text-indigo-400 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <p className="text-red-400 text-sm">{error || "Something went wrong"}</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">{today}</p>
        </div>
        <Link
          href="/analytics"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Full Analytics
        </Link>
      </div>

      {/* Alerts row */}
      {(summary.followUps.overdue > 0 || summary.invoices.overdue > 0 || summary.followUps.today > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AlertCard
            label="Overdue Follow-ups"
            value={summary.followUps.overdue}
            color="bg-red-500/5 border-red-500/20 text-red-400"
            href="/follow-ups?status=overdue"
          />
          <AlertCard
            label="Today's Follow-ups"
            value={summary.followUps.today}
            color="bg-amber-500/5 border-amber-500/20 text-amber-400"
            href="/follow-ups?view=today"
          />
          <AlertCard
            label="Overdue Invoices"
            value={summary.invoices.overdue}
            color="bg-orange-500/5 border-orange-500/20 text-orange-400"
            href="/invoices?status=overdue"
          />
        </div>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(summary.revenue.total)}
          sub={`${formatCurrency(summary.revenue.thisMonth)} this month`}
          growth={summary.revenue.growth}
          accent="bg-indigo-500/20"
          href="/invoices"
          icon={
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Leads"
          value={summary.leads.total}
          sub={`${summary.leads.newThisMonth} new this month`}
          growth={summary.leads.growth}
          accent="bg-violet-500/20"
          href="/leads"
          icon={
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="Customers"
          value={summary.customers.total}
          sub={`${summary.customers.newThisMonth} new this month`}
          accent="bg-emerald-500/20"
          href="/customers"
          icon={
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Conversion Rate"
          value={`${summary.leads.conversionRate}%`}
          sub={`${summary.leads.won} deals won`}
          accent="bg-amber-500/20"
          href="/leads"
          icon={
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Follow-ups",
            value: summary.followUps.pending,
            sub: `${summary.followUps.today} due today`,
            accent: "bg-blue-500/20",
            href: "/follow-ups",
            iconColor: "text-blue-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            label: "Pending Tasks",
            value: summary.tasks.pending,
            sub: `${summary.tasks.today} due today`,
            accent: "bg-purple-500/20",
            href: "/tasks",
            iconColor: "text-purple-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            ),
          },
          {
            label: "Pending Invoices",
            value: summary.invoices.pending,
            sub: `${summary.invoices.overdue} overdue`,
            accent: "bg-orange-500/20",
            href: "/invoices?status=pending",
            iconColor: "text-orange-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: "Lost Leads",
            value: summary.leads.lost,
            sub: "Need attention",
            accent: "bg-red-500/20",
            href: "/leads?status=lost",
            iconColor: "text-red-400",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${stat.accent} flex items-center justify-center`}>
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
                {stat.sub && <p className="text-slate-600 text-xs mt-0.5">{stat.sub}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Pipeline Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Total value:</span>
              <span className="text-indigo-400 text-xs font-semibold">
                {pipeline ? formatCurrency(pipeline.totalPipelineValue) : "—"}
              </span>
            </div>
          </div>
          {pipeline ? (
            <PipelineBar pipeline={pipeline} />
          ) : (
            <p className="text-slate-600 text-sm text-center py-6">No pipeline data</p>
          )}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400 text-xs">Won: {summary.leads.won}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-400 text-xs">Lost: {summary.leads.lost}</span>
            </div>
            <Link href="/leads/pipeline" className="text-indigo-400 text-xs ml-auto hover:text-indigo-300 transition-colors">
              View full pipeline →
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add New Lead", href: "/leads/new", icon: "🎯", color: "hover:border-indigo-500/40 hover:bg-indigo-500/5" },
              { label: "Add Customer", href: "/customers/new", icon: "👤", color: "hover:border-emerald-500/40 hover:bg-emerald-500/5" },
              { label: "Schedule Follow-up", href: "/follow-ups/new", icon: "📅", color: "hover:border-blue-500/40 hover:bg-blue-500/5" },
              { label: "Create Task", href: "/tasks/new", icon: "✅", color: "hover:border-violet-500/40 hover:bg-violet-500/5" },
              { label: "New Quotation", href: "/quotations/new", icon: "📄", color: "hover:border-purple-500/40 hover:bg-purple-500/5" },
              { label: "New Invoice", href: "/invoices/new", icon: "🧾", color: "hover:border-amber-500/40 hover:bg-amber-500/5" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 p-3 rounded-xl border border-slate-800 transition-all ${action.color}`}
              >
                <span className="text-base">{action.icon}</span>
                <span className="text-slate-300 text-sm">{action.label}</span>
                <svg className="w-4 h-4 text-slate-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
          <span className="text-slate-600 text-xs">{activities.length} events</span>
        </div>
        {activities.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-6">No recent activity</p>
        ) : (
          <div>
            {activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}