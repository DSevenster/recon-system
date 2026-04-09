const statusConfig = {
  fail: {
    border: "border-red-200",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Blocker",
    dot: "bg-red-500",
    btn: "text-red-700 bg-red-50 hover:bg-red-100 border-red-200",
  },
  warn: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "Warning",
    dot: "bg-amber-500",
    btn: "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200",
  },
}

const CONFIDENCE_CHECK_TYPES = new Set(["Fuzzy match", "Entity resolution"])

function getConfidenceStyle(confidence) {
  if (confidence >= 0.85) return { barColor: "bg-green-500", label: "high confidence", textColor: "text-green-600" }
  if (confidence >= 0.6) return { barColor: "bg-amber-400", label: "resolved", textColor: "text-amber-600" }
  if (confidence >= 0.3) return { barColor: "bg-amber-500", label: "low confidence — review", textColor: "text-amber-700" }
  return { barColor: "bg-red-500", label: "cannot resolve", textColor: "text-red-600" }
}

export default function FlagCard({ result, onRaisePAS, raisedPAS }) {
  const config = statusConfig[result.status]
  const isParked = raisedPAS.has(result.id)

  const showConfidence =
    result.status === "warn" &&
    CONFIDENCE_CHECK_TYPES.has(result.checkType) &&
    result.confidence != null

  const confidenceStyle = showConfidence ? getConfidenceStyle(result.confidence) : null

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

      {showConfidence && (
        <>
          <div className="px-4 pt-3 pb-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Match confidence</span>
              <span className={`text-xs font-medium ${confidenceStyle.textColor}`}>
                {Math.round(result.confidence * 100)}% — {confidenceStyle.label}
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${confidenceStyle.barColor} transition-all duration-500`}
                style={{ width: `${Math.round(result.confidence * 100)}%` }}
              />
            </div>
          </div>
          {result.worstPair && (
            <p className="text-xs text-gray-400 italic px-4 pb-2">
              Lowest pair: &ldquo;{result.worstPair.valueA}&rdquo; vs &ldquo;{result.worstPair.valueB}&rdquo;
            </p>
          )}
        </>
      )}

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
              className={`w-full text-xs font-medium border rounded-md px-3 py-2 cursor-pointer transition-colors ${config.btn}`}
            >
              Raise PAS query
            </button>
          </div>
        )
      )}
    </div>
  )
}
