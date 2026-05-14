import { shameData } from '../utils/shameData'
import ShameCard from '../components/ShameCard'
import { formatDollar } from '../utils/format'
import { useHallOfShame } from '../hooks/useBirdeye'

function computeStats(data) {
  const total = data.length
  const timed = data.filter((t) => t.timeToRugMinutes != null)
  const avgMinutes = timed.length
    ? Math.round(timed.reduce((s, t) => s + t.timeToRugMinutes, 0) / timed.length)
    : 0
  const avgTime =
    avgMinutes >= 60
      ? `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`
      : `${avgMinutes}m`
  const totalLost = data.reduce((s, t) => s + (t.liquidityAtFlag ?? 0), 0)
  const avgScore = Math.round(
    data.reduce((s, t) => s + t.rugScoreAtFlag, 0) / total
  )
  return { total, avgTime, totalLost, avgScore }
}

function StatBox({ label, value, valueClass = 'text-primary' }) {
  return (
    <div className="flex-1 bg-surface border border-border rounded p-4 flex flex-col gap-1 min-w-[140px]">
      <div className="text-[10px] text-muted tracking-widest uppercase">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${valueClass}`}>{value}</div>
    </div>
  )
}

export default function HallOfShame() {
  const { liveTokens } = useHallOfShame()

  // Merge live detections (front) with static data (back), deduplicated by address
  const liveAddresses = new Set(liveTokens.map((t) => t.address))
  const allData = [
    ...liveTokens,
    ...shameData.filter((t) => !liveAddresses.has(t.address)),
  ]

  const { total, avgTime, totalLost, avgScore } = computeStats(allData)

  const tweetText = `🚨 @RugRadar caught ${total} rug pulls before they happened.\n\n${formatDollar(totalLost)} in liquidity protected.\n\nCheck if YOUR tokens are safe: https://rugradar.vercel.app\n\n#BirdeyeAPI @birdeye_data #Solana`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-risk tracking-tight mb-2">
          ☠ HALL OF SHAME
        </h1>
        <p className="text-muted text-sm tracking-wider">
          Tokens RugRadar flagged.{' '}
          <span className="text-primary">They rugged anyway.</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-8">
        <StatBox
          label="Rugs Caught"
          value={total}
          valueClass="text-risk"
        />
        <StatBox
          label="Avg Time to Rug"
          value={avgTime}
          valueClass="text-caution"
        />
        <StatBox
          label="Total Value Lost"
          value={formatDollar(totalLost)}
          valueClass="text-risk"
        />
        <StatBox
          label="Avg RugScore at Flag"
          value={`${avgScore}/100`}
          valueClass="text-risk"
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {allData.map((token) => (
          <ShameCard key={token.address} token={token} />
        ))}
      </div>

      {/* CTA */}
      <div className="border border-border rounded bg-surface p-6 text-center space-y-4">
        <div className="text-sm text-primary font-bold tracking-wider">
          Did RugRadar save you? Tweet it 👇
        </div>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          Help the community avoid rugs. Share RugRadar before someone loses their bag.
        </p>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/80 text-white text-sm font-bold rounded transition-colors"
        >
          <span>𝕏</span>
          Tweet This
        </a>
        <div className="text-[11px] text-muted/60 mt-2 font-mono max-w-sm mx-auto break-words">
          🚨 @RugRadar caught {total} rug pulls before they happened. {formatDollar(totalLost)} protected. #BirdeyeAPI
        </div>
      </div>
    </div>
  )
}
