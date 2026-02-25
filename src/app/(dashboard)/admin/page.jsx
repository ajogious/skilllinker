/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import StatusBadge from "@/components/shared/StatusBadge";
import { StarDisplay } from "@/components/shared/StarRating";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") return;
    setLoading(true);
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/jobs").then((r) => r.json()),
      fetch("/api/admin/reviews").then((r) => r.json()),
    ])
      .then(([u, j, r]) => {
        setUsers(u.users || []);
        setJobs(j.jobs || []);
        setReviews(r.reviews || []);
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleVerifyToggle = async (userId, currentStatus) => {
    setVerifyLoading((p) => ({ ...p, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                tradesmanProfile: {
                  ...u.tradesmanProfile,
                  isVerified: data.isVerified,
                },
              }
            : u,
        ),
      );
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setVerifyLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    users: users.length,
    clients: users.filter((u) => u.role === "CLIENT").length,
    tradesmen: users.filter((u) => u.role === "TRADESMAN").length,
    verified: users.filter((u) => u.tradesmanProfile?.isVerified).length,
    jobs: jobs.length,
    openJobs: jobs.filter((j) => j.status === "OPEN").length,
    completedJobs: jobs.filter((j) => j.status === "COMPLETED").length,
    reviews: reviews.length,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm">
              Manage users, jobs and platform activity
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: stats.users,
              sub: `${stats.clients} clients`,
              color: "text-white",
            },
            {
              label: "Tradesmen",
              value: stats.tradesmen,
              sub: `${stats.verified} verified`,
              color: "text-emerald-400",
            },
            {
              label: "Total Jobs",
              value: stats.jobs,
              sub: `${stats.openJobs} open`,
              color: "text-blue-400",
            },
            {
              label: "Reviews",
              value: stats.reviews,
              sub: `${stats.completedJobs} completed jobs`,
              color: "text-amber-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <p className={`text-3xl font-bold mb-0.5 ${s.color}`}>
                {s.value}
              </p>
              <p className="text-sm text-white font-medium">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: "users", label: `Users (${stats.users})` },
            { key: "jobs", label: `Jobs (${stats.jobs})` },
            { key: "reviews", label: `Reviews (${stats.reviews})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === "users" && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="TRADESMAN">Tradesmen</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Joined
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        Activity
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <span className="text-xs font-bold text-indigo-400">
                                  {user.name?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              user.role === "CLIENT"
                                ? "bg-indigo-500/20 text-indigo-400"
                                : user.role === "TRADESMAN"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-xs text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          {user.role === "TRADESMAN" &&
                          user.tradesmanProfile ? (
                            <div className="text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <StarDisplay
                                  rating={user.tradesmanProfile.avgRating}
                                  size="sm"
                                />
                                <span>
                                  {user.tradesmanProfile.avgRating.toFixed(1)}
                                </span>
                              </div>
                              <p className="mt-0.5">
                                {user.tradesmanProfile.totalReviews} reviews
                              </p>
                            </div>
                          ) : user.role === "CLIENT" ? (
                            <span className="text-xs text-slate-500">
                              {user._count?.clientJobs || 0} jobs posted
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {user.role === "TRADESMAN" && (
                              <button
                                onClick={() =>
                                  handleVerifyToggle(
                                    user.id,
                                    user.tradesmanProfile?.isVerified,
                                  )
                                }
                                disabled={verifyLoading[user.id]}
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-all ${
                                  user.tradesmanProfile?.isVerified
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
                                } disabled:opacity-50`}
                              >
                                {verifyLoading[user.id]
                                  ? "..."
                                  : user.tradesmanProfile?.isVerified
                                    ? "✓ Verified"
                                    : "Verify"}
                              </button>
                            )}
                            {user.role === "TRADESMAN" && (
                              <Link
                                href={`/tradesman/${user.id}`}
                                target="_blank"
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                View →
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No users found
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {tab === "jobs" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Client
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Tradesman
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">
                          {job.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {job.category} · {job.location}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-xs text-slate-300">
                          {job.client?.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {job.client?.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {job.tradesman ? (
                          <>
                            <p className="text-xs text-slate-300">
                              {job.tradesman.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {job.tradesman.email}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-600">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={job.status} size="sm" />
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {jobs.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm">
                No jobs found
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === "reviews" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Client
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Tradesman
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white truncate max-w-[180px]">
                          {review.job?.title}
                        </p>
                        {review.comment && (
                          <p className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">
                            &quot;{review.comment}&quot;
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StarDisplay rating={review.rating} size="sm" />
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          {review.rating}/5
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-xs text-slate-300">
                          {review.client?.name}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-xs text-slate-300">
                          {review.tradesman?.name}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reviews.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm">
                No reviews found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
