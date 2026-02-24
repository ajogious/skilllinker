/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
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

export default async function ClientDashboard() {
  const session = await requireRole("CLIENT");

  const [jobs, recentTradesmen] = await Promise.all([
    prisma.job.findMany({
      where: { clientId: session.user.id },
      include: {
        tradesman: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.tradesmanProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, location: true, avatar: true },
        },
      },
      orderBy: { avgRating: "desc" },
      take: 4,
    }),
  ]);

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => ["ACCEPTED", "IN_PROGRESS"].includes(j.status))
      .length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
    open: jobs.filter((j) => j.status === "OPEN").length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Find skilled tradesmen or manage your jobs
            </p>
          </div>
          <Link
            href="/client/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all"
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
            Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs", value: stats.total, color: "text-white" },
            { label: "Open", value: stats.open, color: "text-blue-400" },
            { label: "Active", value: stats.active, color: "text-amber-400" },
            {
              label: "Completed",
              value: stats.completed,
              color: "text-emerald-400",
            },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Recent Jobs</h2>
              <Link
                href="/client/jobs"
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm mb-3">
                  No jobs posted yet
                </p>
                <Link
                  href="/client/jobs/new"
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Post your first job →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/client/jobs/${job.id}`}
                    className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {job.tradesman
                          ? `Assigned to ${job.tradesman.name}`
                          : `${job.category} • ${job.location}`}
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

          {/* Top Tradesmen */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Top Tradesmen</h2>
              <Link
                href="/client/browse"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Browse →
              </Link>
            </div>

            <div className="space-y-3">
              {recentTradesmen.map((t) => (
                <Link
                  key={t.userId}
                  href={`/tradesman/${t.user.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {t.user.avatar ? (
                      <img
                        src={t.user.avatar}
                        alt={t.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-indigo-400">
                        {t.user.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                      {t.user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {t.skills?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  {t.isVerified && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
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
                </Link>
              ))}
            </div>

            <Link
              href="/client/browse"
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium border border-slate-700 transition-all flex items-center justify-center gap-2"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Find Tradesmen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
