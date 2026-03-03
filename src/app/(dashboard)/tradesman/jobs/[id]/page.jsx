/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import StatusBadge from "@/components/shared/StatusBadge";
import JobTimeline from "@/components/shared/JobTimeline";
import ChatBox from "@/components/shared/ChatBox";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner, PageLoading } from "@/components/shared/LoadingSpinner";

export default function TradesmanJobDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
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
      toast({ title: "Done!", description: data.message, variant: "default" });
      await fetchJob();
    } catch (err) {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const isMyJob = job?.tradesmanId === session?.user?.id;
  // Accept button shows for unassigned open jobs OR jobs directly hired to this tradesman
  const isOpenJob = job?.status === "OPEN" && (!job?.tradesmanId || job?.tradesmanId === session?.user?.id);
  const showChat =
    isMyJob && ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(job?.status);

  if (loading) return <PageLoading />;

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
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
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
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Chat */}
            {showChat && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Messages with {job.client?.name}
                </h2>
                <ChatBox jobId={id} jobStatus={job.status} />
              </div>
            )}

            {/* Client info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Client
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <span className="font-bold text-slate-400 text-sm">
                    {job.client.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {job.client.name}
                  </p>
                  {job.client.location && (
                    <p className="text-xs text-slate-500">
                      {job.client.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Action buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Actions
              </h3>

              {isOpenJob && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction("accept")}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                      "✓"
                    )}{" "}
                    Accept Job
                  </button>

                  {/* Decline invite — only for direct hires (job pre-assigned to me while still OPEN) */}
                  {job?.tradesmanId === session?.user?.id && (
                    <button
                      onClick={() => handleAction("decline")}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-sm transition-all disabled:opacity-50"
                    >
                      Decline Invite
                    </button>
                  )}
                </div>
              )}

              {isMyJob && job.status === "ACCEPTED" && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction("start")}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "🔧 Start Work"}
                  </button>
                  <button
                    onClick={() => handleAction("decline")}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-sm transition-all disabled:opacity-50"
                  >
                    Decline Job
                  </button>
                </div>
              )}

              {isMyJob && job.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleAction("complete")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "✅ Mark as Complete"}
                </button>
              )}

              {job.status === "COMPLETED" && (
                <p className="text-center text-emerald-400 text-sm font-medium py-2">
                  ✅ Job Completed
                </p>
              )}

              {job.status === "CANCELLED" && (
                <p className="text-center text-red-400 text-sm font-medium py-2">
                  ❌ Job Cancelled
                </p>
              )}
            </div>

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
