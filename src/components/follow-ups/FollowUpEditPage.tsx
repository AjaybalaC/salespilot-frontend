"use client";


import { useEffect, useState } from "react";
import FollowUpForm from "./FollowUpForm";
import { followUpApi } from "@/lib/followup-task.api";
import { FollowUpFormData } from "@/types/followup-task.types";
 
interface FollowUpEditProps {
  followUpId: string;
}
 
export function FollowUpEditPage({ followUpId }: FollowUpEditProps) {
  const [data, setData] = useState<Partial<FollowUpFormData> | null>(null);
  const [error, setError] = useState("");
 
  useEffect(() => {
    followUpApi
      .getById(followUpId)
      .then((f) => {
        setData({
          lead: f.lead?._id || "",
          customer: f.customer?._id || "",
          assignedTo: f.assignedTo?._id || "",
          type: f.type || "",
          scheduledAt: f.scheduledAt
            ? new Date(f.scheduledAt).toISOString().slice(0, 16)
            : "",
          notes: f.notes || "",
        });
      })
      .catch(() => setError("Failed to load follow-up"));
  }, [followUpId]);
 
  if (error) return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
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
 
  return <FollowUpForm mode="edit" followUpId={followUpId} initialData={data} />;
}