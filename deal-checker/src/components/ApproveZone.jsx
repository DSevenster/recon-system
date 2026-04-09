export default function ApproveZone({ deal, passCount, onApprove }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between gap-6">
      <div className="flex-1">
        <div className="text-sm font-medium text-green-800 mb-1">
          All {passCount} checks passed automatically
        </div>
        <div className="text-xs text-green-600">
          No conflicts found across 9 documents. Ready for payout.
        </div>
      </div>
      <button
        onClick={onApprove}
        aria-label={`Approve and pay out deal ${deal.id}`}
        className="bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-medium px-8 py-3 rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer"
      >
        Approve and pay out
      </button>
    </div>
  )
}
