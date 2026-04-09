import { runChecks } from '../engine/runChecks.js'

const statusStyles = {
  selected: {
    fail: "bg-red-100 text-red-700 border-red-300",
    warn: "bg-amber-100 text-amber-700 border-amber-300",
    pass: "bg-green-100 text-green-700 border-green-300",
  },
  unselected: "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
}

export default function DealSwitcher({ deals, selectedDealId, approvedDeals, onSelect }) {
  const statusMap = deals.reduce((acc, d) => {
    const r = runChecks(d)
    const hasFail = r.some(c => c.status === "fail")
    const hasWarn = r.some(c => c.status === "warn")
    acc[d.id] = hasFail ? "fail" : hasWarn ? "warn" : "pass"
    return acc
  }, {})

  return (
    <div className="flex gap-2" role="tablist" aria-label="Deal selector">
      {deals.map(d => {
        const isSelected = d.id === selectedDealId
        const status = statusMap[d.id]
        const isApproved = approvedDeals?.has(d.id)
        const classes = isSelected
          ? statusStyles.selected[status]
          : statusStyles.unselected

        return (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            role="tab"
            aria-selected={isSelected}
            aria-label={`Switch to deal ${d.id}`}
            className={`px-3 py-1 text-sm font-medium rounded-full border cursor-pointer inline-flex items-center gap-1.5 ${classes}`}
          >
            {isApproved ? (
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                />
              </svg>
            ) : null}
            {d.id}
          </button>
        )
      })}
    </div>
  )
}
