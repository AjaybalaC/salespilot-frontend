"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer.api";
import { Customer } from "@/types/customer.types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-sm w-32 shrink-0">{label}</span>
      <span className="text-slate-200 text-sm break-all">{value}</span>
    </div>
  );
}

interface Props {
  customerId: string;
}

export default function CustomerDetail({ customerId }: Props) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await customerApi.getById(customerId);
        setCustomer(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [customerId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerApi.delete(customerId);
      router.push("/customers");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-400">Customer not found</p>
          <Link href="/customers" className="text-indigo-400 text-sm hover:text-indigo-300">
            Back to customers →
          </Link>
        </div>
      </div>
    );
  }

  const avatarColors = [
    "bg-indigo-500", "bg-violet-500", "bg-purple-500",
    "bg-blue-500", "bg-emerald-500",
  ];
  const avatarColor = avatarColors[customer.name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6 space-y-6">
      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-white font-semibold">Delete {customer.name}?</h3>
              <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl font-bold">Customer Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customerId}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-800/60 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white text-xl font-bold`}
            >
              {getInitials(customer.name)}
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">{customer.name}</h2>
              {customer.company && (
                <p className="text-slate-400 text-sm">{customer.company}</p>
              )}
              {customer.industry && (
                <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  {customer.industry}
                </span>
              )}
            </div>
          </div>

          {/* Quick contact */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm group-hover:text-white transition-colors truncate">
                {customer.email}
              </span>
            </a>
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                {customer.phone}
              </span>
            </a>
            {customer.website && (
              <a
                href={customer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm group-hover:text-white transition-colors truncate">
                  {customer.website.replace(/^https?:\/\//, "")}
                </span>
              </a>
            )}
          </div>

          {/* Social links */}
          {(customer.socialLinks?.linkedin ||
            customer.socialLinks?.twitter ||
            customer.socialLinks?.facebook) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              {customer.socialLinks.linkedin && (
                <a
                  href={`https://linkedin.com/in/${customer.socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs text-center transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {customer.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${customer.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs text-center transition-colors"
                >
                  Twitter
                </a>
              )}
              {customer.socialLinks.facebook && (
                <a
                  href={customer.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs text-center transition-colors"
                >
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Business Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">
              Business Information
            </h3>
            <div>
              <InfoRow label="Company" value={customer.company} />
              <InfoRow label="Industry" value={customer.industry} />
              <InfoRow label="GST Number" value={customer.gstNumber} />
              <InfoRow label="Address" value={customer.address} />
              <InfoRow label="Website" value={customer.website} />
            </div>
          </div>

          {/* Meta */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">
              Record Details
            </h3>
            <div>
              <InfoRow label="Assigned To" value={customer.assignedTo?.name} />
              <InfoRow label="Created By" value={customer.createdBy?.name} />
              <InfoRow
                label="Created On"
                value={new Date(customer.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <InfoRow
                label="Last Updated"
                value={new Date(customer.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-slate-400">
                Notes
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/leads/new?customerId=${customerId}`}
              className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Create Lead</p>
                <p className="text-slate-500 text-xs">Start a new deal</p>
              </div>
            </Link>
            <Link
              href={`/quotations/new?customerId=${customerId}`}
              className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">New Quotation</p>
                <p className="text-slate-500 text-xs">Send a proposal</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}