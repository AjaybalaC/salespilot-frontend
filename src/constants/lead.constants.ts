import { LeadStatus, LeadPriority } from "@/types/lead.types";

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  new: {
    label: "New",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  contacted: {
    label: "Contacted",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
  },
  meeting_scheduled: {
    label: "Meeting Scheduled",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  proposal_sent: {
    label: "Proposal Sent",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  negotiation: {
    label: "Negotiation",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  won: {
    label: "Won",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  lost: {
    label: "Lost",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export const PRIORITY_CONFIG: Record<
  LeadPriority,
  { label: string; color: string; dot: string }
> = {
  low: { label: "Low", color: "text-slate-400", dot: "bg-slate-400" },
  medium: { label: "Medium", color: "text-amber-400", dot: "bg-amber-400" },
  high: { label: "High", color: "text-red-400", dot: "bg-red-400" },
};

export const PIPELINE_STAGES: LeadStatus[] = [
  "new",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
];

export const formatCurrency = (value?: number) => {
  if (!value) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};