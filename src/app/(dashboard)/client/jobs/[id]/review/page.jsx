"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { StarPicker } from "@/components/shared/StarRating";

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.job?.status !== "COMPLETED") {
          router.push(`/client/jobs/${id}`);
          return;
        }
        if (d.job?.review) {
          router.push(`/client/jobs/${id}`);
          return;
        }
        setJob(d.job);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/client/jobs/${id}?reviewed=true`);
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="text-4xl mb-3">⭐</div>
            <h1 className="text-xl font-bold text-white mb-1">
              Leave a Review
            </h1>
            <p className="text-slate-400 text-sm">
              How was your experience with{" "}
              <span className="text-white font-medium">
                {job?.tradesman?.name}
              </span>
              ?
            </p>
          </div>

          {/* Job summary */}
          <div className="bg-slate-800 rounded-xl p-3.5 mb-6">
            <p className="text-xs text-slate-500 mb-0.5">Job</p>
            <p className="text-sm font-semibold text-white">{job?.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              {job?.category} · {job?.location}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Rating <span className="text-red-400">*</span>
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">
                Comment{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Describe your experience. Was the work done well? Was the tradesman professional and on time?"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-500 mt-1 text-right">
                {comment.length}/500
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !rating}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
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
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
