// Error message
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
      <svg
        className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-400 hover:text-red-300 mt-1.5 underline transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
