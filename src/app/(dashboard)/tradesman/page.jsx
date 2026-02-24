/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/shared/Navbar";

const STATUS_STYLES = {
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACCEPTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  IN_PROGRESS: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function TradesmanDashboard() {
  const session = await requireRole("TRADESMAN");

  const profile = await prisma.tradesmanProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  // Redirect to onboarding if no skills yet
  if (!profile || profile.skills.length === 0) {
    redirect("/tradesman/onboarding");
  }

  const jobs = await prisma.job.findMany({
    where: { tradesmanId: session.user.id },
    include: {
      client: { select: { name: true, avatar: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  // Incoming open job requests (jobs in tradesman's skill categories, not yet taken)
  const openRequests = await prisma.job.findMany({
    where: {
      status: "OPEN",
      tradesmanId: null,
      category: { in: profile.skills },
    },
    include: {
      client: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = {
    active: jobs.filter((j) => ["ACCEPTED", "IN_PROGRESS"].includes(j.status))
      .length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
    rating: profile.avgRating,
    reviews: profile.totalReviews,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                {profile.user.avatar ? (
                  <img
                    src={profile.user.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-indigo-400">
                    {profile.user.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-950">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile.user.name}
              </h1>
              <p className="text-slate-400 text-sm">
                {profile.skills?.slice(0, 3).join(" · ")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/tradesman/${session.user.id}`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium border border-slate-700 transition-all"
            >
              View Profile
            </Link>
            <Link
              href="/tradesman/edit"
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Active Jobs",
              value: stats.active,
              color: "text-amber-400",
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "text-emerald-400",
            },
            {
              label: "Avg Rating",
              value: stats.rating > 0 ? stats.rating.toFixed(1) : "—",
              color: "text-amber-400",
            },
            { label: "Reviews", value: stats.reviews, color: "text-white" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <p className={`text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">My Jobs</h2>
              <Link
                href="/tradesman/jobs"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all →
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-7 h-7 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">No jobs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/tradesman/jobs/${job.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-400">
                        {job.client.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        from {job.client.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[job.status]}`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Open Job Requests */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">
                Available Jobs
                {openRequests.length > 0 && (
                  <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {openRequests.length} new
                  </span>
                )}
              </h2>
              <Link
                href="/tradesman/jobs"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Browse all →
              </Link>
            </div>

            {openRequests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-7 h-7 text-slate-600"
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
                <p className="text-slate-400 text-sm">
                  No open requests in your skills yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {openRequests.map((job) => (
                  <Link
                    key={job.id}
                    href={`/tradesman/jobs/${job.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {job.category} • {job.location}
                      </p>
                    </div>
                    {job.budget && (
                      <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">
                        ₦{Number(job.budget).toLocaleString()}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile completion card (if not verified) */}
        {!profile.isVerified && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">
                Profile not yet verified
              </p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Complete your profile and an admin will verify your account,
                increasing client trust.
              </p>
            </div>
            <Link
              href="/tradesman/edit"
              className="text-xs font-medium text-amber-400 hover:text-amber-300 flex-shrink-0 transition-colors"
            >
              Complete →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
