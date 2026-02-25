"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import StatusBadge from "@/components/shared/StatusBadge";

const STATUS_FILTERS = [
  "All",
  "OPEN",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] =
      s === "All" ? jobs.length : jobs.filter((j) => j.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Jobs</h1>
            <p className="text-slate-400 text-sm mt-1">
              {jobs.length} total job{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/client/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {STATUS_FILTERS.map((s) =>
            counts[s] > 0 || s === "All" ? (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                  filter === s
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600"
                }`}
              >
                {s === "All" ? "All" : s.replace("_", " ")}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s ? "bg-indigo-400/30" : "bg-slate-800"}`}
                >
                  {counts[s]}
                </span>
              </button>
            ) : null,
          )}
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-800 rounded-full w-20" />
                </div>
                <div className="h-3 bg-slate-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">
              {filter === "All"
                ? "No jobs posted yet"
                : `No ${filter.replace("_", " ").toLowerCase()} jobs`}
            </h3>
            {filter === "All" && (
              <Link
                href="/client/jobs/new"
                className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
              >
                Post your first job →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/client/jobs/${job.id}`}
                className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {job.title}
                  </h3>
                  <StatusBadge status={job.status} size="sm" />
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
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
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
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
                    <span className="text-emerald-400 font-medium">
                      ₦{Number(job.budget).toLocaleString()}
                    </span>
                  )}
                  {job.tradesman && (
                    <span className="flex items-center gap-1 text-indigo-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {job.tradesman.name}
                    </span>
                  )}
                  <span className="ml-auto">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
