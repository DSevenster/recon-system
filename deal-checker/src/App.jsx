import { useState, useMemo } from 'react'
import { deals } from './data/index.js'
import { runChecks } from './engine/runChecks.js'
import DealSwitcher from './components/DealSwitcher.jsx'
import DealHeader from './components/DealHeader.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import FlagList from './components/FlagList.jsx'
import PassingChecks from './components/PassingChecks.jsx'
import ApproveZone from './components/ApproveZone.jsx'
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
        {fails.length === 0 ? (
          <ApproveZone deal={selectedDeal} passCount={passes.length} warns={warns} totalChecks={results.length} />
        ) : (
          <FlagList
            fails={fails}
            warns={warns}
            onRaisePAS={(result) => setActivePAS(result)}
            raisedPAS={raisedPAS}
          />
        )}
        <PassingChecks passes={passes} />
        {fails.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4 pb-2">
            {passes.length} of {results.length} checks completed automatically · {fails.length} item{fails.length !== 1 ? "s" : ""} need your attention · estimated time to resolve: ~3 min
          </p>
        )}
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
