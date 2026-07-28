// ── Follow-up Types ──────────────────────────────────────────────────────────

export type FollowUpType =
  | "call"
  | "email"
  | "meeting"
  | "visit"
  | "demo"
  | "other";

export type FollowUpStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "overdue";

export interface FollowUp {
  _id: string;
  lead: {
    _id: string;
    title: string;
    status: string;
  };
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  type: FollowUpType;
  status: FollowUpStatus;
  scheduledAt: string;
  completedAt?: string;
  notes?: string;
  meetingNotes?: string;
  reminderSent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpFormData {
  lead: string;
  customer: string;
  assignedTo: string;
  type: FollowUpType | "";
  scheduledAt: string;
  notes: string;
}

export interface CompleteFollowUpData {
  meetingNotes: string;
  notes: string;
}

export interface FollowUpListResponse {
  followUps: FollowUp[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Task Types ────────────────────────────────────────────────────────────────

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
export type TaskType =
  | "sales_call"
  | "meeting"
  | "client_visit"
  | "documentation"
  | "follow_up"
  | "other";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  lead?: {
    _id: string;
    title: string;
  };
  customer?: {
    _id: string;
    name: string;
    company?: string;
  };
  dueDate: string;
  completedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  type: TaskType | "";
  priority: TaskPriority | "";
  assignedTo: string;
  lead: string;
  customer: string;
  dueDate: string;
}

export interface KanbanData {
  todo: Task[];
  in_progress: Task[];
  completed: Task[];
  cancelled: Task[];
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}