"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

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

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledTradesman = searchParams.get("tradesman");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast({ title: "Category required", description: "Please select a category.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          ...(prefilledTradesman && { tradesmanId: prefilledTradesman }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Job posted successfully", description: "Your job is now live.", variant: "default" });
      router.push(`/client/jobs/${data.job.id}`);
    } catch (err) {
      toast({ title: "Failed to post job", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {prefilledTradesman && (
        <div className="mb-5 flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm text-indigo-300">
            You are posting this job <span className="font-semibold text-indigo-200">directly for a specific tradesman</span>. Fill in the details below to proceed.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

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
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${formData.category === cat
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
            Include details about the problem, materials needed, and any special
            requirements
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

        {/* Preview */}
        {formData.title && formData.category && (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">
              Preview
            </p>
            <p className="text-sm font-semibold text-white">{formData.title}</p>
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
              <LoadingSpinner size="sm" className="text-white" />
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
  );
}

export default function NewJobPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <NewJobForm />
      </Suspense>
    </div>
  );
}
