import { useState } from 'react'

const categories = ["Customer", "Vehicle", "Financial", "Dealer / payee", "Documents", "System"]

export default function PassingChecks({ passes }) {
  const [isOpen, setIsOpen] = useState(false)

  const grouped = {}
  for (const cat of categories) {
    const items = passes.filter(r => r.category === cat)
    if (items.length > 0) grouped[cat] = items
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Collapse passing checks" : "Expand passing checks"}
        className="w-full px-4 py-3 flex items-center justify-between cursor-pointer"
      >
        <span className="text-sm font-medium text-gray-700">
          {passes.length} checks passed
        </span>
        <span className="text-gray-400 text-xs">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {category}
              </h4>
              <div className="space-y-1">
                {items.map(r => (
                  <div key={r.id} className="flex items-center gap-2 py-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">{r.field}</span>
                    <span className="text-xs text-gray-400">{r.checkType}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
