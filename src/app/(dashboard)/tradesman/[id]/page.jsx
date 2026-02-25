/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function StarRating({ rating, size = "md" }) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sz} ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function TradesmanPublicProfile({ params }) {
  const { id } = await params;
  const session = await auth();

  const profile = await prisma.tradesmanProfile.findFirst({
    where: { userId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          location: true,
          avatar: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) notFound();

  const reviews = await prisma.review.findMany({
    where: { tradesmanId: id },
    include: { client: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const completedJobs = await prisma.job.count({
    where: { tradesmanId: id, status: "COMPLETED" },
  });

  const isOwnProfile = session?.user?.id === id;
  const isClient = session?.user?.role === "CLIENT";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Back nav */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href={isClient ? "/client/browse" : "/"}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
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
            Back to browse
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/20 flex items-center justify-center overflow-hidden">
                {profile.user.avatar ? (
                  <img
                    src={profile.user.avatar}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-indigo-400">
                    {profile.user.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <svg
                    className="w-3.5 h-3.5 text-white"
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

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {profile.user.name}
                </h1>
                {profile.isVerified && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              {profile.user.location && (
                <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  {profile.user.location}
                </div>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={profile.avgRating} />
                  <span className="text-sm text-white font-medium">
                    {profile.avgRating > 0
                      ? profile.avgRating.toFixed(1)
                      : "No ratings yet"}
                  </span>
                  {profile.totalReviews > 0 && (
                    <span className="text-sm text-slate-500">
                      ({profile.totalReviews} reviews)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
                  <p className="text-lg font-bold text-white">
                    {completedJobs}
                  </p>
                  <p className="text-xs text-slate-400">Jobs done</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
                  <p className="text-lg font-bold text-white">
                    {profile.yearsExperience}
                  </p>
                  <p className="text-xs text-slate-400">Yrs experience</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
                  <p className="text-lg font-bold text-white">
                    {profile.skills?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Skills</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {isOwnProfile ? (
                <Link
                  href="/tradesman/edit"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-all text-center"
                >
                  Edit Profile
                </Link>
              ) : isClient ? (
                <Link
                  href={`/client/jobs/new?tradesman=${id}`}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-all text-center"
                >
                  Hire {profile.user.name?.split(" ")[0]}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Skills & Services
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Reviews{" "}
            {reviews.length > 0 && (
              <span className="text-slate-600">({reviews.length})</span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400">
                        {review.client.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {review.client.name}
                      </p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="ml-auto text-xs text-slate-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-400 ml-11">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
