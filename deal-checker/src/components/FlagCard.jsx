const statusConfig = {
  fail: {
    border: "border-red-200",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Blocker",
    dot: "bg-red-500",
  },
  warn: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "Warning",
    dot: "bg-amber-500",
  },
}

export default function FlagCard({ result, onRaisePAS, raisedPAS }) {
  const config = statusConfig[result.status]
  const isParked = raisedPAS.has(result.id)

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block w-2 h-2 rounded-full ${config.dot}`} />
            <span className="text-sm font-medium text-gray-900">{result.field}</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
              {config.badgeLabel}
            </span>
            <span className="text-xs text-gray-400">{result.category}</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{result.message}</p>
          <div className="flex flex-wrap gap-1.5">
            {result.sources.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-500">
                {s.doc}: {typeof s.value === "string" ? s.value : JSON.stringify(s.value)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {isParked ? (
        <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-600 font-medium mt-3">
          PAS query sent — awaiting broker response
        </div>
      ) : (
        result.pasTemplate && (
          <div className="mt-3 pt-3 border-t border-gray-200/60">
            <button
              onClick={() => onRaisePAS(result)}
              aria-label={`Raise PAS query for ${result.field}`}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              Raise PAS query
            </button>
          </div>
        )
      )}
    </div>
  )
}
