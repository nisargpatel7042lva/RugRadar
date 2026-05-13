import { formatDollar } from '../utils/format'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ShameCard({ token }) {
  const {
    name,
    symbol,
    rugScoreAtFlag,
    flaggedAt,
    timeToRug,
    liquidityAtFlag,
    percentLoss,
    triggerSignals,
  } = token

  const scoreColor =
    rugScoreAtFlag >= 80
      ? 'text-risk bg-risk/20 border-risk/40'
      : 'text-caution bg-caution/20 border-caution/40'

  return (
    <div className="relative bg-surface border border-border border-t-2 border-t-risk rounded overflow-hidden animate-fade-in-up">
      {/* RUGRADAR CALLED IT stamp */}
      <div className="absolute top-5 right-3 -rotate-[14deg] select-none pointer-events-none z-10">
        <div className="border-2 border-risk text-risk text-[9px] tracking-[0.2em] px-2 py-1 font-bold opacity-35 uppercase">
          RUGRADAR CALLED IT
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pr-20">
          <div>
            <h3 className="font-bold text-base text-primary leading-tight">
              {name} <span>💀</span>
            </h3>
            <div className="text-xs text-muted mt-0.5">{symbol}</div>
          </div>
          <div className={`text-xs px-2 py-1 rounded border font-bold tabular-nums shrink-0 ${scoreColor}`}>
            {rugScoreAtFlag}/100
          </div>
        </div>

        {/* Rugged in */}
        <div className="text-sm font-bold text-risk tracking-wider">
          ☠ RUGGED IN {timeToRug.toUpperCase()}
        </div>

        {/* Triggered signals */}
        <div className="space-y-1">
          {triggerSignals.map((sig, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted">
              <span className="text-risk shrink-0">⚠</span>
              {sig}
            </div>
          ))}
        </div>

        {/* Liquidity before/after */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted">Liquidity:</span>
          <span className="text-caution font-bold">{formatDollar(liquidityAtFlag)}</span>
          <span className="text-muted">→</span>
          <span className="text-risk font-bold">$0</span>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* % Loss + flagged time */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-muted tracking-widest uppercase mb-0.5">Total Loss</div>
            <div className="text-3xl font-bold text-risk tabular-nums">
              {percentLoss}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted tracking-widest uppercase mb-0.5">Flagged</div>
            <div className="text-xs text-muted">{formatDate(flaggedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
