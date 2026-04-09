export default function SummaryBar({ fails, warns, passes }) {
  const total = fails.length + warns.length + passes.length

  const cards = [
    { value: fails.length, label: "Critical", color: "text-red-600" },
    { value: warns.length, label: "Warnings", color: "text-amber-600" },
    { value: passes.length, label: "Auto-passed", color: "text-green-600" },
    { value: total, label: "Total checks", color: "text-gray-900" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className="bg-white border border-gray-200 rounded-lg p-3">
          <div className={`text-2xl font-medium ${card.color}`}>{card.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
