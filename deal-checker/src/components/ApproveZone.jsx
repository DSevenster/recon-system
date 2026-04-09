import { useState } from 'react'

const MANUAL_CHECK_MINUTES = 12
const DAILY_DEAL_VOLUME = 80
const AUTO_PASS_RATE = 0.95
const DAILY_HOURS_SAVED = ((DAILY_DEAL_VOLUME * AUTO_PASS_RATE * MANUAL_CHECK_MINUTES) / 60).toFixed(1)

export default function ApproveZone({ deal, passCount, warns = [], totalChecks }) {
  const [approved, setApproved] = useState(false)

  if (approved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
        <svg
          className="w-8 h-8 text-green-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-green-800">
            Deal {deal.id} approved — payment processing initiated
          </p>
          <p className="text-xs text-green-600 mt-1">
            {MANUAL_CHECK_MINUTES} minutes of manual checking eliminated.
            This deal required no human input.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-green-800">
            {warns.length > 0
              ? `${passCount} checks passed — ${warns.length} warning${warns.length !== 1 ? "s" : ""} noted`
              : `All ${passCount} checks passed automatically`}
          </div>
          <div className="text-xs text-green-600 mt-0.5">
            {warns.length > 0
              ? "No blockers found across 9 documents. Ready for payout."
              : "No conflicts found across 9 documents. Ready for payout."}
          </div>
        </div>
        <button
          onClick={() => setApproved(true)}
          aria-label={`Approve and pay out deal ${deal.id}`}
          className="bg-green-600 hover:bg-green-700 text-white text-base font-semibold px-6 py-2.5 rounded-lg shadow-sm cursor-pointer flex-shrink-0"
        >
          Approve and pay out
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mt-4">
        <div className="flex-1 bg-white border border-green-100 rounded-lg p-3">
          <p className="text-xl font-medium text-green-700">{totalChecks ?? passCount}</p>
          <p className="text-xs text-green-400 mt-0.5">Checks automated</p>
        </div>
        <div className="flex-1 bg-white border border-green-100 rounded-lg p-3">
          <p className="text-xl font-medium text-green-700">9</p>
          <p className="text-xs text-green-400 mt-0.5">Documents verified</p>
        </div>
        <div className="flex-1 bg-white border border-green-100 rounded-lg p-3">
          <p className="text-xl font-medium text-green-700">0</p>
          <p className="text-xs text-green-400 mt-0.5">Issues found</p>
        </div>
      </div>

      {/* Time saved highlight */}
      <div className="flex items-baseline gap-3 bg-white border border-green-100 rounded-lg px-4 py-3 mt-3">
        <span className="text-2xl font-medium text-green-700">
          {MANUAL_CHECK_MINUTES} min
        </span>
        <div>
          <span className="text-sm text-green-600">
            manual check time saved on this deal
          </span>
          <span className="block text-xs text-green-400 mt-0.5">
            ~{DAILY_HOURS_SAVED} hrs/day saved across {DAILY_DEAL_VOLUME} deals
            · {Math.round(AUTO_PASS_RATE * 100)}% require no human input
          </span>
        </div>
      </div>
    </div>
  )
}
