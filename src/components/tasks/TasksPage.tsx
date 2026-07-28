"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { taskApi } from "@/lib/followup-task.api";
import { Task, TaskStatus, KanbanData } from "@/types/followup-task.types";
import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_TYPE_CONFIG,
  formatDate,
} from "@/constants/followup-task.constants";

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = TASK_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getAll({ page, limit: 10, status, priority, type });
      setTasks(res.tasks);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      showToast("error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [page, status, priority, type]);

  useEffect(() => {
    if (view === "list") fetchTasks();
  }, [fetchTasks, view]);

  useEffect(() => {
    setPage(1);
  }, [status, priority, type]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await taskApi.delete(deleteId);
      showToast("success", "Task deleted");
      setDeleteId(null);
      fetchTasks();
    } catch {
      showToast("error", "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      showToast("success", "Status updated");
      fetchTasks();
    } catch {
      showToast("error", "Failed to update status");
    }
  };

  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-white font-semibold">Delete task?</h3>
              <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} task{total !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "kanban" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Kanban
            </button>
          </div>
          <Link
            href="/tasks/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "To Do", value: todo, color: "text-slate-400", bg: "bg-slate-500/20" },
          { label: "In Progress", value: inProgress, color: "text-blue-400", bg: "bg-blue-500/20" },
          { label: "Completed", value: completed, color: "text-emerald-400", bg: "bg-emerald-500/20" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters (list view only) */}
      {view === "list" && (
        <div className="flex flex-wrap gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all">
            <option value="">All statuses</option>
            {Object.entries(TASK_STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all">
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all">
            <option value="">All types</option>
            {Object.entries(TASK_TYPE_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl">✅</div>
              <p className="text-slate-400 text-sm">No tasks found</p>
              <Link href="/tasks/new" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">Create your first task →</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {tasks.map((task) => {
                const typeCfg = TASK_TYPE_CONFIG[task.type];
                const priorityCfg = TASK_PRIORITY_CONFIG[task.priority];
                const isDue = new Date(task.dueDate) < new Date() && task.status !== "completed" && task.status !== "cancelled";
                return (
                  <div key={task._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors group">
                    {/* Status toggle */}
                    <button
                      onClick={() => handleStatusChange(task._id, task.status === "completed" ? "todo" : "completed")}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-emerald-500"}`}
                    >
                      {task.status === "completed" && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Type icon */}
                    <span className="text-lg shrink-0">{typeCfg.icon}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <StatusBadge status={task.status} />
                        <span className={`inline-flex items-center gap-1 text-xs ${priorityCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                          {priorityCfg.label}
                        </span>
                        {task.lead && (
                          <span className="text-slate-500 text-xs truncate">{task.lead.title}</span>
                        )}
                      </div>
                    </div>

                    {/* Due date */}
                    <div className="hidden sm:block shrink-0">
                      <p className={`text-xs ${isDue ? "text-red-400" : "text-slate-500"}`}>
                        {isDue ? "⚠ " : ""}{formatDate(task.dueDate)}
                      </p>
                    </div>

                    {/* Assigned */}
                    <div className="hidden md:block shrink-0">
                      <p className="text-slate-500 text-xs">{task.assignedTo?.name}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Link href={`/tasks/${task._id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button onClick={() => setDeleteId(task._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && <KanbanView onStatusChange={() => {}} />}
    </div>
  );
}

function KanbanView({ onStatusChange }: { onStatusChange: () => void }) {
  const [kanban, setKanban] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskApi.getKanban().then((data) => {
      setKanban(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      const data = await taskApi.getKanban();
      setKanban(data);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const columns: { key: TaskStatus; nextStatus: TaskStatus | null }[] = [
    { key: "todo", nextStatus: "in_progress" },
    { key: "in_progress", nextStatus: "completed" },
    { key: "completed", nextStatus: null },
    { key: "cancelled", nextStatus: null },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(({ key, nextStatus }) => {
        const cfg = TASK_STATUS_CONFIG[key];
        const columnTasks: Task[] = kanban?.[key] || [];
        return (
          <div key={key} className="min-w-64 flex-shrink-0">
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg border ${cfg.bg} ${cfg.border}`}>
              <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{columnTasks.length}</span>
            </div>
            <div className="space-y-2 p-2 bg-slate-900/50 border border-t-0 border-slate-800 rounded-b-lg min-h-40">
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-slate-600 text-xs">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority];
                  const typeCfg = TASK_TYPE_CONFIG[task.type];
                  const isDue = new Date(task.dueDate) < new Date() && key !== "completed" && key !== "cancelled";
                  return (
                    <div key={task._id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 hover:border-slate-700 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white text-sm font-medium line-clamp-2">{task.title}</p>
                        <span className="text-base shrink-0">{typeCfg.icon}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-xs ${priorityCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                          {priorityCfg.label}
                        </span>
                        <span className={`text-xs ${isDue ? "text-red-400" : "text-slate-500"}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChange(task._id, nextStatus)}
                          className={`w-full py-1.5 rounded-md text-xs font-medium transition-colors ${TASK_STATUS_CONFIG[nextStatus].bg} ${TASK_STATUS_CONFIG[nextStatus].color} hover:opacity-80`}
                        >
                          Move to {TASK_STATUS_CONFIG[nextStatus].label} →
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}