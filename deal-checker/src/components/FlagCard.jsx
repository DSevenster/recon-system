const statusConfig = {
  fail: {
    wrapper: "bg-red-50 border border-red-200 rounded-xl overflow-hidden mb-3",
    accent: { borderLeft: '4px solid #ef4444' },
    header: "px-4 py-3 border-b border-red-100 flex items-center gap-3",
    badge: "bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded",
    field: "text-sm font-semibold text-red-900 flex-1",
    category: "text-xs text-red-500",
    message: "px-4 pt-3 text-sm text-red-800",
    actionRow: "px-4 py-3 border-t border-red-100",
    button: "bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all cursor-pointer",
  },
  warn: {
    wrapper: "bg-amber-50 border border-amber-100 rounded-xl overflow-hidden mb-3",
    accent: { borderLeft: '3px solid #f59e0b' },
    header: "px-4 py-3 border-b border-amber-100 flex items-center gap-3",
    badge: "bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded",
    field: "text-sm font-medium text-amber-900 flex-1",
    category: "text-xs text-amber-500",
    message: "px-4 pt-3 text-sm text-amber-800",
    actionRow: "px-4 py-3 border-t border-amber-100",
    button: "text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer",
  },
}

export default function FlagCard({ result, onRaisePAS, raisedPAS }) {
  const config = statusConfig[result.status]
  const isParked = raisedPAS.has(result.id)

  return (
    <div className={config.wrapper} style={config.accent}>
      <div className={config.header}>
        <span className={config.badge}>
          {result.status === "fail" ? "Blocker" : "Warning"}
        </span>
        <span className={config.field}>{result.field}</span>
        <span className={config.category}>{result.category}</span>
      </div>

      <p className={config.message}>{result.message}</p>

      {result.status === "fail" ? (
        <div className="px-4 py-3 grid gap-2 sm:grid-cols-2">
          {result.sources.map((s, i) => (
            <div key={i} className="bg-white border border-red-200 rounded-lg p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-red-400 mb-1">
                {s.doc}
              </div>
              <div className="text-base font-semibold text-red-600">
                {typeof s.value === "string" ? s.value : JSON.stringify(s.value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {result.sources.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-white border border-amber-100 rounded text-xs text-amber-700">
                {s.doc}: {typeof s.value === "string" ? s.value : JSON.stringify(s.value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {isParked ? (
        <div className="mx-4 mb-4 bg-blue-50 rounded px-3 py-2 text-xs text-blue-600 font-medium">
          PAS query sent — awaiting broker response
        </div>
      ) : (
        <>
          {result.status === "fail" && (
            <div className={config.actionRow}>
              <button
                onClick={() => onRaisePAS(result)}
                aria-label={`Raise PAS query for ${result.field}`}
                className={config.button}
              >
                Raise PAS query
              </button>
            </div>
          )}
          {result.status === "warn" && !result.noAction && result.pasTemplate && (
            <div className={config.actionRow}>
              <button
                onClick={() => onRaisePAS(result)}
                aria-label={`Raise PAS query for ${result.field}`}
                className={config.button}
              >
                Raise PAS query
              </button>
            </div>
          )}
          {result.status === "warn" && result.noAction && (
            <div className="px-4 pb-3">
              <span className="text-xs text-gray-400 italic">
                No action required — flagged for transparency only
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
