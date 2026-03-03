/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import StatusBadge from "@/components/shared/StatusBadge";
import JobTimeline from "@/components/shared/JobTimeline";
import ChatBox from "@/components/shared/ChatBox";
import { StarDisplay } from "@/components/shared/StarRating";
import { useToast } from "@/hooks/use-toast";

export default function ClientJobDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJob(data.job);
    } catch (err) {
      toast({ title: "Failed to load job", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchJob();
    } catch (err) {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-400">Job not found or failed to load.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-indigo-400"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const showChat =
    job?.tradesman &&
    ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(job?.status);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
          Back to jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-xl font-bold text-white">{job.title}</h1>
                <StatusBadge status={job.status} />
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-5">
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {job.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-slate-500"
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
                  {job.location}
                </span>
                {job.budget && (
                  <span className="text-emerald-400 font-semibold">
                    ₦{Number(job.budget).toLocaleString()}
                  </span>
                )}
                <span className="text-slate-500 text-xs">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Chat — only when tradesman is assigned */}
            {showChat && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Messages with {job.tradesman?.name}
                </h2>
                <ChatBox jobId={id} jobStatus={job.status} />
              </div>
            )}

            {/* Review prompt */}
            {job.status === "COMPLETED" && !job.review && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="text-3xl">⭐</div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-400">
                    How was the job?
                  </p>
                  <p className="text-xs text-amber-400/70 mt-0.5">
                    Leave a review to help other clients find great tradesmen
                  </p>
                </div>
                <Link
                  href={`/client/jobs/${id}/review`}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-all"
                >
                  Review
                </Link>
              </div>
            )}

            {/* Existing review */}
            {job.review && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Your Review
                </h3>
                <StarDisplay rating={job.review.rating} size="md" showNumber />
                {job.review.comment && (
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                    {job.review.comment}
                  </p>
                )}
              </div>
            )}

            {/* Assigned tradesman */}
            {job.tradesman && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Assigned Tradesman
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                    {job.tradesman.avatar ? (
                      <img
                        src={job.tradesman.avatar}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="font-bold text-indigo-400">
                        {job.tradesman.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">
                      {job.tradesman.name}
                    </p>
                    {job.tradesman.location && (
                      <p className="text-xs text-slate-500">
                        {job.tradesman.location}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/tradesman/${job.tradesman.id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Actions */}
            {["OPEN", "ACCEPTED", "IN_PROGRESS"].includes(job.status) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Actions
                </h3>
                <button
                  onClick={() => handleAction("cancel")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Cancel Job"}
                </button>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Progress
              </h3>
              <JobTimeline status={job.status} />
            </div>

            {/* Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Details
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Posted</span>
                  <span className="text-slate-300">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Updated</span>
                  <span className="text-slate-300">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Category</span>
                  <span className="text-slate-300">{job.category}</span>
                </div>
                {job.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Budget</span>
                    <span className="text-emerald-400 font-semibold">
                      ₦{Number(job.budget).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
