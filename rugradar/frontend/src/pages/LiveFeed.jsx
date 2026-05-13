import { useState, useEffect } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { useNewListings } from '../hooks/useBirdeye'
import PipelineVisualizer from '../components/PipelineVisualizer'
import StatsBar from '../components/StatsBar'
import Skeleton from '../components/Skeleton'
import TokenRow from '../components/TokenRow'

const FILTER_LEVELS = ['ALL', 'HIGH RISK', 'CAUTION', 'SAFE']
const SORT_OPTIONS = [
  { value: 'score', label: 'RugScore' },
  { value: 'age', label: 'Age' },
  { value: 'liquidity', label: 'Liquidity' },
]

const FILTER_ACTIVE_CLASS = {
  'ALL': 'bg-accent border-accent text-white',
  'HIGH RISK': 'bg-risk border-risk text-white',
  'CAUTION': 'bg-caution border-caution text-black',
  'SAFE': 'bg-safe border-safe text-black',
}

export default function LiveFeed() {
  const { tokens, loading, refreshing, error, lastUpdated, refresh } = useNewListings(30000)

  const [filterLevel, setFilterLevel] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [expandedRow, setExpandedRow] = useState(null)
  const [pipelineStep, setPipelineStep] = useState(-1)

  // Animate pipeline during any fetch
  useEffect(() => {
    if (!refreshing) {
      if (!loading) setPipelineStep(6)
      return
    }
    setPipelineStep(0)
    let step = 0
    const t = setInterval(() => {
      step += 1
      setPipelineStep(Math.min(step, 5))
    }, 350)
    return () => clearInterval(t)
  }, [refreshing, loading])

  const filtered = tokens
    .filter((t) => {
      if (filterLevel !== 'ALL' && t.rugScore?.level !== filterLevel) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        t.name?.toLowerCase().includes(q) ||
        t.symbol?.toLowerCase().includes(q) ||
        t.address?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.rugScore?.score ?? 0) - (a.rugScore?.score ?? 0)
      if (sortBy === 'age') return (a.age ?? Infinity) - (b.age ?? Infinity)
      if (sortBy === 'liquidity') return (a.liquidity ?? Infinity) - (b.liquidity ?? Infinity)
      return 0
    })

  const totalScanned = tokens.length
  const highRiskCount = tokens.filter((t) => t.rugScore?.level === 'HIGH RISK').length
  const rugsCount = tokens.filter((t) => (t.rugScore?.score ?? 0) >= 80).length

  function handleToggleRow(address) {
    setExpandedRow((prev) => (prev === address ? null : address))
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Pipeline */}
      <PipelineVisualizer activeStep={pipelineStep} />

      {/* Stats */}
      <StatsBar
        totalScanned={totalScanned}
        highRiskCount={highRiskCount}
        rugsCount={rugsCount}
        lastUpdated={lastUpdated}
      />

      {/* Filter bar */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-surface flex flex-wrap items-center gap-2 md:gap-3">
        {/* Level filters */}
        <div className="flex gap-1 flex-wrap">
          {FILTER_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`text-[11px] px-2.5 py-1.5 rounded border tracking-wider transition-colors whitespace-nowrap ${
                filterLevel === level
                  ? FILTER_ACTIVE_CLASS[level]
                  : 'border-border text-muted hover:text-primary hover:border-muted'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-border rounded px-2 bg-bg flex-1 min-w-[140px] max-w-xs">
          <Search size={12} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search name / symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-primary placeholder-muted outline-none py-1.5 w-full"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs bg-bg border border-border text-primary rounded px-2 py-1.5 outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={refresh}
          disabled={refreshing}
          className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-primary border border-border px-3 py-1.5 rounded hover:border-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-4 flex-1">
        {loading ? (
          <Skeleton rows={6} />
        ) : error ? (
          <div className="border border-risk/40 bg-risk/10 rounded p-8 text-center max-w-lg mx-auto">
            <div className="text-risk font-bold text-sm mb-2 tracking-widest">⚠ FEED UNAVAILABLE</div>
            <div className="text-muted text-xs mb-4 font-mono">{error}</div>
            <div className="text-muted text-xs mb-4">
              Make sure the backend is running on port 4000 and your BIRDEYE_API_KEY is set.
            </div>
            <button
              onClick={refresh}
              className="text-xs text-accent border border-accent px-4 py-2 rounded hover:bg-accent hover:text-white transition-colors"
            >
              ↻ Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted text-sm tracking-widest blink">NO TOKENS DETECTED</div>
            <div className="text-muted text-xs mt-3 opacity-50">
              {tokens.length > 0
                ? 'No tokens match the current filter.'
                : 'Waiting for new Solana listings...'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {['TOKEN', 'AGE', 'LIQUIDITY', 'VOL 24H', 'FLAGS', 'RUGSCORE', 'ACTION'].map(
                    (col) => (
                      <th
                        key={col}
                        className="py-2 px-3 text-left text-[10px] text-muted tracking-widest font-normal uppercase"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((token) => (
                  <TokenRow
                    key={token.address}
                    token={token}
                    expanded={expandedRow === token.address}
                    onToggle={() => handleToggleRow(token.address)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-muted text-[11px] py-5 border-t border-border tracking-widest">
        Auto-refreshing every 30s &nbsp;·&nbsp; Powered by{' '}
        <span className="text-accent">Birdeye Data</span>
      </div>
    </div>
  )
}
