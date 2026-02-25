// LoadingSpinner
export function LoadingSpinner({ size = "md", className = "" }) {
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-5 h-5";
  return (
    <svg
      className={`animate-spin ${sz} text-indigo-400 ${className}`}
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
  );
}

// Full page loading state
export function PageLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-800 rounded w-3/4" />
              <div className="h-2.5 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-2.5 bg-slate-800 rounded" />
            <div className="h-2.5 bg-slate-800 rounded w-4/5" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-16 bg-slate-800 rounded-full" />
            <div className="h-5 w-20 bg-slate-800 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
