import { FollowUpStatus, FollowUpType, TaskStatus, TaskPriority, TaskType } from "@/types/followup-task.types";

export const FOLLOWUP_STATUS_CONFIG: Record<
  FollowUpStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
  overdue: {
    label: "Overdue",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export const FOLLOWUP_TYPE_CONFIG: Record<
  FollowUpType,
  { label: string; icon: string }
> = {
  call: { label: "Call", icon: "📞" },
  email: { label: "Email", icon: "📧" },
  meeting: { label: "Meeting", icon: "🤝" },
  visit: { label: "Visit", icon: "🚗" },
  demo: { label: "Demo", icon: "💻" },
  other: { label: "Other", icon: "📌" },
};

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  todo: {
    label: "To Do",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; dot: string }
> = {
  low: { label: "Low", color: "text-slate-400", dot: "bg-slate-400" },
  medium: { label: "Medium", color: "text-amber-400", dot: "bg-amber-400" },
  high: { label: "High", color: "text-red-400", dot: "bg-red-400" },
};

export const TASK_TYPE_CONFIG: Record<TaskType, { label: string; icon: string }> = {
  sales_call: { label: "Sales Call", icon: "📞" },
  meeting: { label: "Meeting", icon: "🤝" },
  client_visit: { label: "Client Visit", icon: "🚗" },
  documentation: { label: "Documentation", icon: "📄" },
  follow_up: { label: "Follow Up", icon: "🔁" },
  other: { label: "Other", icon: "📌" },
};

export const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isOverdue = (date: string, status: string) => {
  if (status === "completed" || status === "cancelled") return false;
  return new Date(date) < new Date();
};