const badgeConfig = {
  parked: {
    className: "bg-blue-100 text-blue-700 border border-blue-300",
    label: () => "PAS sent — awaiting broker",
  },
  fail: {
    className: "bg-red-100 text-red-700 border border-red-300",
    label: (count) => `${count} blocker${count === 1 ? "" : "s"} — cannot pay out`,
  },
  partial: {
    className: "bg-amber-100 text-amber-700 border border-amber-300",
    label: (raisedCount, failCount) => `${raisedCount} of ${failCount} PAS queries sent`,
  },
  warn: {
    className: "bg-amber-100 text-amber-700 border border-amber-300",
    label: () => "Review recommended",
  },
  pass: {
    className: "bg-green-100 text-green-700 border border-green-300",
    label: () => "Ready to pay out",
  },
}

export default function DealHeader({ deal, status, raisedPAS, fails }) {
  const broker = deal.broker || deal.meta?.broker
  const allActioned = fails.length > 0 && fails.every(f => raisedPAS.has(f.id))
  const someActioned = fails.some(f => raisedPAS.has(f.id))
  const effectiveStatus = status === "fail"
    ? allActioned
      ? "parked"
      : someActioned
        ? "partial"
        : "fail"
    : status
  const badge = badgeConfig[effectiveStatus]

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white rounded-lg border border-gray-200 p-4">
      <div>
        <div className="text-base font-medium text-gray-900">{deal.id}</div>
        <div className="text-sm text-gray-500">
          {deal.brokerApplication.customerName} · {deal.brokerApplication.vehicleMake} · {broker}
        </div>
      </div>
      <span className={`self-start sm:self-auto px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${badge.className}`}>
        {effectiveStatus === "partial"
          ? badge.label(raisedPAS.size, fails.length)
          : badge.label(fails.length)}
      </span>
    </div>
  )
}
