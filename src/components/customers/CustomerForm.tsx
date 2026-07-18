"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer.api";
import { CustomerFormData } from "@/types/customer.types";

const INDUSTRIES = [
  "IT", "Real Estate", "Marketing", "Finance",
  "Healthcare", "Education", "Retail", "Other",
];

const EMPTY_FORM: CustomerFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  gstNumber: "",
  industry: "",
  website: "",
  notes: "",
  assignedTo: "",
  socialLinks: { linkedin: "", twitter: "", facebook: "" },
};

interface Props {
  initialData?: Partial<CustomerFormData>;
  customerId?: string;
  mode: "create" | "edit";
}

export default function CustomerForm({ initialData, customerId, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CustomerFormData>({
    ...EMPTY_FORM,
    ...initialData,
    socialLinks: {
      ...EMPTY_FORM.socialLinks,
      ...(initialData?.socialLinks || {}),
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "social">("basic");

  const set = (field: keyof CustomerFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setSocial = (field: keyof CustomerFormData["socialLinks"], value: string) =>
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.phone || !form.assignedTo) {
      setError("Name, email, phone and assigned user are required.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "create") {
        await customerApi.create(form);
      } else if (customerId) {
        await customerApi.update(customerId, form);
      }
      router.push("/customers");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Business Details" },
    { id: "social", label: "Social & Notes" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">
              {mode === "create" ? "Add Customer" : "Edit Customer"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "create"
                ? "Fill in the details to create a new customer"
                : "Update the customer information"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name *">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Company">
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                      placeholder="Acme Corp"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email *">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="john@acme.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone *">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="9876543210"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Assigned To (User ID) *">
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(e) => set("assignedTo", e.target.value)}
                    placeholder="User ID from your team"
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {/* Business Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Industry">
                    <select
                      value={form.industry}
                      onChange={(e) => set("industry", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="GST Number">
                    <input
                      type="text"
                      value={form.gstNumber}
                      onChange={(e) => set("gstNumber", e.target.value)}
                      placeholder="22AAAAA0000A1Z5"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Website">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://acme.com"
                    className={inputClass}
                  />
                </Field>
                <Field label="Address">
                  <textarea
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="123 Main St, Chennai, Tamil Nadu"
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            )}

            {/* Social & Notes Tab */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <Field label="LinkedIn">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      linkedin.com/in/
                    </span>
                    <input
                      type="text"
                      value={form.socialLinks.linkedin}
                      onChange={(e) => setSocial("linkedin", e.target.value)}
                      placeholder="username"
                      className={`${inputClass} pl-28`}
                    />
                  </div>
                </Field>
                <Field label="Twitter / X">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      value={form.socialLinks.twitter}
                      onChange={(e) => setSocial("twitter", e.target.value)}
                      placeholder="handle"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="Facebook">
                  <input
                    type="text"
                    value={form.socialLinks.facebook}
                    onChange={(e) => setSocial("facebook", e.target.value)}
                    placeholder="facebook.com/page"
                    className={inputClass}
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Any internal notes about this customer..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {activeTab !== "basic" && (
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "social" ? "details" : "basic")
                  }
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
              )}
              {activeTab !== "social" ? (
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "basic" ? "details" : "social")
                  }
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : mode === "create" ? (
                    "Create Customer"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";