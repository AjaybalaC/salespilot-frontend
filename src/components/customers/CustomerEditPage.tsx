"use client";

import { useEffect, useState } from "react";
import CustomerForm from "./CustomerForm";
import { customerApi } from "@/lib/customer.api";
import { CustomerFormData } from "@/types/customer.types";

interface Props {
  customerId: string;
}

export default function CustomerEditPage({ customerId }: Props) {
  const [data, setData] = useState<Partial<CustomerFormData> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    customerApi
      .getById(customerId)
      .then((c) => {
        setData({
          name: c.name,
          company: c.company || "",
          email: c.email,
          phone: c.phone,
          address: c.address || "",
          gstNumber: c.gstNumber || "",
          industry: c.industry || "",
          website: c.website || "",
          notes: c.notes || "",
          assignedTo: c.assignedTo?._id || "",
          socialLinks: {
            linkedin: c.socialLinks?.linkedin || "",
            twitter: c.socialLinks?.twitter || "",
            facebook: c.socialLinks?.facebook || "",
          },
        });
      })
      .catch(() => setError("Failed to load customer"));
  }, [customerId]);

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
        <svg
          className="w-6 h-6 text-indigo-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <CustomerForm
      mode="edit"
      customerId={customerId}
      initialData={data}
    />
  );
}