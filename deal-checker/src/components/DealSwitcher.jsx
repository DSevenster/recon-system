import { runChecks } from '../engine/runChecks.js'

const statusStyles = {
  selected: {
    fail: "bg-red-100 text-red-700 border-red-300",
    warn: "bg-amber-100 text-amber-700 border-amber-300",
    pass: "bg-green-100 text-green-700 border-green-300",
  },
  unselected: "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
}

export default function DealSwitcher({ deals, selectedDealId, onSelect }) {
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
            className={`px-3 py-1 text-sm font-medium rounded-full border cursor-pointer ${classes}`}
          >
            {d.id}
          </button>
        )
      })}
    </div>
  )
}
