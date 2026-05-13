import RiskMeter from './RiskMeter'

const MAX_POINTS = 30

export default function SignalBreakdown({ signals = [], score, level }) {
  const totalPossible = signals.reduce((sum, s) => sum + s.points, 0) || 100
  const triggered = signals.filter((s) => s.triggered)

  return (
    <div>
      <div className="text-[10px] text-muted tracking-widest mb-3 uppercase">
        Signal Breakdown — {triggered.length}/{signals.length} triggered
      </div>

      <div className="space-y-2">
        {signals.map((sig, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded border animate-fade-in-up transition-all ${
              sig.triggered
                ? 'border-risk/40 bg-risk/10'
                : 'border-border/40 opacity-70'
            }`}
            style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-xs flex-1 leading-tight ${
                  sig.triggered ? 'text-primary' : 'text-muted'
                }`}
              >
                {sig.label}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded tracking-wider font-bold shrink-0 border ${
                  sig.triggered
                    ? 'bg-risk/20 text-risk border-risk/30'
                    : 'bg-safe/10 text-safe border-safe/20'
                }`}
              >
                {sig.triggered ? 'TRIGGERED' : 'CLEAR'}
              </span>
            </div>

            {/* Points bar */}
            <div className="h-1 bg-border/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${sig.triggered ? 'bg-risk' : 'bg-muted/20'}`}
                style={{
                  width: sig.triggered
                    ? `${(sig.points / MAX_POINTS) * 100}%`
                    : '0%',
                  transition: `width 0.6s ease ${i * 70 + 300}ms`,
                }}
              />
            </div>

            {sig.triggered && (
              <div className="text-[10px] text-risk/60 mt-1 text-right tabular-nums">
                +{sig.points} pts
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total score */}
      {score != null && (
        <div className="mt-6 pt-4 border-t border-border">
          <RiskMeter score={score} />
        </div>
      )}
    </div>
  )
}
