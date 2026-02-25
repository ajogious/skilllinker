import Image from "next/image";
import Link from "next/link";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TradesmanCard({ tradesman }) {
  const {
    user,
    bio,
    skills,
    yearsExperience,
    isVerified,
    avgRating,
    totalReviews,
  } = tradesman;

  return (
    <Link href={`/tradesman/${user.id}`} className="block group">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-200 h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <div className="relative w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/20 overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-indigo-400 flex items-center justify-center w-full h-full">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors truncate">
                {user.name}
              </h3>
              {isVerified && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Verified
                </span>
              )}
            </div>
            {user.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <svg
                  className="w-3 h-3 text-slate-500"
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
                <span className="text-xs text-slate-500 truncate">
                  {user.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="text-xs text-slate-500">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} />
            <span className="text-xs text-slate-400">
              {avgRating > 0 ? avgRating.toFixed(1) : "New"}
              {totalReviews > 0 && (
                <span className="text-slate-600 ml-1">({totalReviews})</span>
              )}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {yearsExperience > 0
              ? `${yearsExperience} yr${yearsExperience > 1 ? "s" : ""} exp`
              : "New"}
          </span>
        </div>
      </div>
    </Link>
  );
}
