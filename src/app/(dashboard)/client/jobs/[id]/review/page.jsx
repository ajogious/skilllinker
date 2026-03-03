"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { StarPicker } from "@/components/shared/StarRating";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner, PageLoading } from "@/components/shared/LoadingSpinner";

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Review submitted", description: "Thank you for sharing your experience!", variant: "default" });
      router.push(`/client/jobs/${id}?reviewed=true`);
    } catch (err) {
      toast({ title: "Review failed", description: err.message || "Failed to submit review.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

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
                  <LoadingSpinner size="sm" className="text-white" />
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
