"use client";

// ── src/components/leads/LeadEditPage.tsx ────────────────────────────────────
import { useEffect, useState } from "react";
import LeadForm from "./LeadForm";
import { leadApi } from "@/lib/lead.api";
import { LeadFormData } from "@/types/lead.types";

interface Props {
  leadId: string;
}

export default function LeadEditPage({ leadId }: Props) {
  const [data, setData] = useState<Partial<LeadFormData> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    leadApi
      .getById(leadId)
      .then((lead) => {
        setData({
          title: lead.title,
          customer: lead.customer?._id || "",
          source: lead.source || "",
          priority: lead.priority || "",
          status: lead.status || "",
          budget: lead.budget ? String(lead.budget) : "",
          expectedDealValue: lead.expectedDealValue
            ? String(lead.expectedDealValue)
            : "",
          expectedCloseDate: lead.expectedCloseDate
            ? lead.expectedCloseDate.split("T")[0]
            : "",
          assignedTo: lead.assignedTo?._id || "",
          description: lead.description || "",
          nextFollowUpDate: lead.nextFollowUpDate
            ? lead.nextFollowUpDate.split("T")[0]
            : "",
          lostReason: lead.lostReason || "",
          tags: lead.tags?.join(", ") || "",
        });
      })
      .catch(() => setError("Failed to load lead"));
  }, [leadId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return <LeadForm mode="edit" leadId={leadId} initialData={data} />;
}