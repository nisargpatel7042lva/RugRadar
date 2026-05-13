function StatBox({ label, value, valueClass = 'text-primary' }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-3 px-4 relative">
      <span className="text-[9px] text-muted tracking-widest uppercase mb-1">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${valueClass}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function StatsBar({ totalScanned, highRiskCount, rugsCount, lastUpdated }) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  return (
    <div className="w-full bg-surface border border-border scanline">
      <div className="flex divide-x divide-border">
        <StatBox label="Tokens Scanned" value={totalScanned} />
        <StatBox
          label="High Risk"
          value={highRiskCount}
          valueClass={highRiskCount > 0 ? 'text-risk' : 'text-primary'}
        />
        <StatBox
          label="Rugs Caught"
          value={rugsCount}
          valueClass={rugsCount > 0 ? 'text-risk font-bold' : 'text-primary'}
        />
        <StatBox label="Last Update" value={formattedTime} valueClass="text-muted text-sm" />
      </div>
    </div>
  )
}
