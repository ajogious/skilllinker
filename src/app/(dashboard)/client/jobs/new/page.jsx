"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Welding",
  "Tiling",
  "Roofing",
  "Masonry",
  "HVAC",
  "Landscaping",
  "Flooring",
  "Plastering",
  "Generator Repair",
  "Solar Installation",
  "Other",
];

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledTradesman = searchParams.get("tradesman");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/client/jobs/${data.job.id}`);
    } catch (err) {
      setError(err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
          <p className="text-slate-400 text-sm mt-1">
            Describe your job clearly to attract the right tradesmen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-1.5">
              Job Title <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              A clear, short title helps tradesmen quickly understand the job
            </p>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Fix leaking bathroom pipe, Install ceiling fan..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, category: cat }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    formData.category === cat
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Include details about the problem, materials needed, and any
              special requirements
            </p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe your job in detail. E.g.:&#10;- What needs to be done&#10;- Location in house/building&#10;- Current condition&#10;- Any special access requirements..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none leading-relaxed"
            />
            <p className="text-xs text-slate-600 mt-1.5 text-right">
              {formData.description.length} characters
            </p>
          </div>

          {/* Location & Budget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">
                Job Location <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">
                Budget{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                  ₦
                </span>
                <input
                  name="budget"
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Leave empty if you want tradesmen to quote their price
              </p>
            </div>
          </div>

          {/* Summary preview */}
          {formData.title && formData.category && (
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">
                Preview
              </p>
              <p className="text-sm font-semibold text-white">
                {formData.title}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                  {formData.category}
                </span>
                {formData.location && (
                  <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                    📍 {formData.location}
                  </span>
                )}
                {formData.budget && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    ₦{Number(formData.budget).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !formData.title ||
              !formData.category ||
              !formData.description ||
              !formData.location
            }
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
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
                Posting Job...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Post Job
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
