"use client";

import { useState, useEffect } from "react";
import TaskForm from "@/components/tasks/TaskForm";
import { taskApi } from "@/lib/followup-task.api";
import { TaskFormData } from "@/types/followup-task.types";
 
interface TaskEditProps {
  taskId: string;
}
 
export function TaskEditPage({ taskId }: TaskEditProps) {
  const [data, setData] = useState<Partial<TaskFormData> | null>(null);
  const [err, setErr] = useState("");
 
  useEffect(() => {
    taskApi
      .getById(taskId)
      .then((t) => {
        setData({
          title: t.title,
          description: t.description || "",
          type: t.type || "",
          priority: t.priority || "",
          assignedTo: t.assignedTo?._id || "",
          lead: t.lead?._id || "",
          customer: t.customer?._id || "",
          dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
        });
      })
      .catch(() => setErr("Failed to load task"));
  }, [taskId]);
 
  if (err) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <p className="text-red-400 text-sm">{err}</p>
    </div>
  );
 
  if (!data) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
 
  return <TaskForm mode="edit" taskId={taskId} initialData={data} />;
}
