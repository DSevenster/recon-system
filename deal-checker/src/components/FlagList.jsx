import FlagCard from './FlagCard.jsx'

export default function FlagList({ fails, warns, onRaisePAS, raisedPAS }) {
  return (
    <div className="space-y-4">
      {fails.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 mt-1">
            Blockers ({fails.length}) — payout cannot proceed
          </h3>
          {fails.map(r => (
            <FlagCard key={r.id} result={r} onRaisePAS={onRaisePAS} raisedPAS={raisedPAS} />
          ))}
        </div>
      )}
      {warns.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-3 mt-4">
            Warnings ({warns.length}) — review recommended
          </h3>
          {warns.map(r => (
            <FlagCard key={r.id} result={r} onRaisePAS={onRaisePAS} raisedPAS={raisedPAS} />
          ))}
        </div>
      )}
    </div>
  )
}
