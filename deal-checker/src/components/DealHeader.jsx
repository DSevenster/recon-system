const badgeConfig = {
  parked: {
    className: "bg-blue-100 text-blue-700 border border-blue-300",
    label: () => "PAS queries sent — awaiting broker",
  },
  fail: {
    className: "bg-red-100 text-red-700 border border-red-300",
    label: (count) => `${count} blocker${count === 1 ? "" : "s"} — cannot pay out`,
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

export default function DealHeader({ deal, status, failCount, raisedPAS, fails }) {
  const allFailsParked = fails && fails.length > 0 && fails.every(f => raisedPAS.has(f.id))
  const effectiveStatus = (status === "fail" && allFailsParked) ? "parked" : status
  const badge = badgeConfig[effectiveStatus]

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white rounded-lg border border-gray-200 p-4">
      <div className="min-w-0">
        <div className="text-base font-medium text-gray-900">{deal.id}</div>
        <div className="text-sm text-gray-500 truncate">
          {deal.brokerApplication.customerName} · {deal.brokerApplication.vehicleMake} · {deal.brokerApplication.vehicleReg} · {deal.meta.broker}
        </div>
      </div>
      <span className={`self-start sm:self-auto px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${badge.className}`}>
        {badge.label(failCount)}
      </span>
    </div>
  )
}
