const STEPS = [
  { status: "OPEN", label: "Job Posted", icon: "📋" },
  { status: "ACCEPTED", label: "Tradesman Assigned", icon: "🤝" },
  { status: "IN_PROGRESS", label: "Work Started", icon: "🔧" },
  { status: "COMPLETED", label: "Job Completed", icon: "✅" },
];

const STATUS_ORDER = ["OPEN", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export default function JobTimeline({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-sm">
          ❌
        </div>
        <p className="text-sm text-red-400 font-medium">Job Cancelled</p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="relative">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.status} className="flex items-start gap-3 relative">
            {/* Vertical line */}
            {index < STEPS.length - 1 && (
              <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-800 -z-0" />
            )}

            {/* Icon circle */}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 border transition-all ${
                isDone
                  ? "bg-emerald-500/20 border-emerald-500/40"
                  : isCurrent
                    ? "bg-indigo-500/20 border-indigo-500/40 ring-2 ring-indigo-500/20"
                    : "bg-slate-800 border-slate-700"
              }`}
            >
              {isDone ? (
                <svg
                  className="w-3.5 h-3.5 text-emerald-400"
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
              ) : (
                <span className={isPending ? "opacity-30" : ""}>
                  {step.icon}
                </span>
              )}
            </div>

            {/* Label */}
            <div className="pb-6">
              <p
                className={`text-sm font-medium transition-colors ${
                  isDone
                    ? "text-emerald-400"
                    : isCurrent
                      ? "text-white"
                      : "text-slate-600"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-slate-500 mt-0.5">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
