import { useState, useMemo } from 'react'
import { deals } from './data/index.js'
import { runChecks } from './engine/runChecks.js'
import DealSwitcher from './components/DealSwitcher.jsx'
import DealHeader from './components/DealHeader.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import FlagList from './components/FlagList.jsx'
import PassingChecks from './components/PassingChecks.jsx'
import PASModal from './components/PASModal.jsx'

function App() {
  const [selectedDealId, setSelectedDealId] = useState("AF-2026-00417")
  const [activePAS, setActivePAS] = useState(null)
  const [raisedPAS, setRaisedPAS] = useState(new Set())

  const selectedDeal = deals.find(d => d.id === selectedDealId)
  const results = useMemo(() => runChecks(selectedDeal), [selectedDealId])

  const fails = results.filter(r => r.status === "fail")
  const warns = results.filter(r => r.status === "warn")
  const passes = results.filter(r => r.status === "pass")

  const overallStatus = fails.length > 0 ? "fail" : warns.length > 0 ? "warn" : "pass"

  function handleRaisePAS(resultId) {
    setRaisedPAS(prev => new Set([...prev, resultId]))
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-green-800">
                All {passes.length} checks passed automatically
              </div>
              <div className="text-xs text-green-600 mt-0.5">
                No conflicts found across 9 documents. Ready for payout.
              </div>
            </div>
            <button
              onClick={() => alert(`Deal ${selectedDeal.id} approved. Payment processing initiated.`)}
              aria-label={`Approve and pay out deal ${selectedDeal.id}`}
              className="bg-green-600 hover:bg-green-700 text-white text-base font-semibold px-6 py-2.5 rounded-lg shadow-sm cursor-pointer"
            >
              Approve and pay out
            </button>
          </div>
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
