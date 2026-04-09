import { useState, useMemo } from 'react'
import { deals } from './data/index.js'
import { deal as deal388 } from './data/deals/AF-2026-00388.js'
import { runChecks } from './engine/runChecks.js'
import DealSwitcher from './components/DealSwitcher.jsx'
import DealHeader from './components/DealHeader.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import ApproveZone from './components/ApproveZone.jsx'
import FlagList from './components/FlagList.jsx'
import PassingChecks from './components/PassingChecks.jsx'
import PASModal from './components/PASModal.jsx'

const results388 = runChecks(deal388)
console.log('fails:', results388.filter(r => r.status === 'fail').length)
console.log('warns:', results388.filter(r => r.status === 'warn').length)
console.log('passes:', results388.filter(r => r.status === 'pass').length)

function App() {
  const [selectedDealId, setSelectedDealId] = useState("AF-2026-00417")
  const [activePAS, setActivePAS] = useState(null)
  const [raisedPAS, setRaisedPAS] = useState(new Set())
  const [approvedDeals, setApprovedDeals] = useState(new Set())

  const selectedDeal = deals.find(d => d.id === selectedDealId)
  const results = useMemo(() => runChecks(selectedDeal), [selectedDealId])

  const fails = results.filter(r => r.status === "fail")
  const warns = results.filter(r => r.status === "warn")
  const passes = results.filter(r => r.status === "pass")

  const overallStatus = fails.length > 0 ? "fail" : warns.length > 0 ? "warn" : "pass"

  function handleRaisePAS(resultId) {
    setRaisedPAS(prev => new Set([...prev, resultId]))
  }

  function handleApprove() {
    setApprovedDeals(prev => new Set([...prev, selectedDeal.id]))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Payout reconciliation</h1>
          <p className="text-sm text-gray-500">Northgate Motor Finance</p>
        </div>
        <DealSwitcher
          deals={deals}
          selectedDealId={selectedDealId}
          approvedDeals={approvedDeals}
          onSelect={(id) => setSelectedDealId(id)}
        />
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <DealHeader
          deal={selectedDeal}
          status={overallStatus}
          failCount={fails.length}
          raisedPAS={raisedPAS}
          fails={fails}
        />
        <SummaryBar fails={fails} warns={warns} passes={passes} />
        {overallStatus === "pass" ? (
          approvedDeals.has(selectedDeal.id) ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="w-5 h-5 text-green-600"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                />
              </svg>
              <div className="text-sm font-medium text-green-800">
                Deal {selectedDeal.id} approved. Payment processing initiated.
              </div>
            </div>
          ) : (
            <ApproveZone
              deal={selectedDeal}
              passCount={passes.length}
              onApprove={handleApprove}
            />
          )
        ) : (
          <FlagList
            fails={fails}
            warns={warns}
            onRaisePAS={(result) => setActivePAS(result)}
            raisedPAS={raisedPAS}
          />
        )}
        <PassingChecks passes={passes} />
      </main>

      <PASModal
        result={activePAS}
        isOpen={activePAS !== null}
        onClose={() => setActivePAS(null)}
        dealBroker={selectedDeal.meta.broker}
        onSend={handleRaisePAS}
      />
    </div>
  )
}

export default App
