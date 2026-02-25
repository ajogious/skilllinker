// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-2xl">
        {icon || (
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
        )}
      </div>
      {title && <h3 className="font-semibold text-white mb-1">{title}</h3>}
      {description && (
        <p className="text-slate-400 text-sm mb-4">{description}</p>
      )}
      {action && (
        <a
          href={action.href}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          {action.label} →
        </a>
      )}
    </div>
  );
}
