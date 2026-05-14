import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, ChevronDown, ChevronUp, Flame, Users, Snowflake, Droplets, Clock, BarChart2 } from 'lucide-react'
import { useNewListings } from '../hooks/useBirdeye'
import PipelineVisualizer from '../components/PipelineVisualizer'
import StatsBar from '../components/StatsBar'
import Skeleton from '../components/Skeleton'
import TokenRow from '../components/TokenRow'
import RugScoreBadge from '../components/RugScoreBadge'
import { formatAge, formatDollar, truncateAddr } from '../utils/format'

function MobileTokenLogo({ logoURI, symbol }) {
  const [error, setError] = useState(false)
  if (!logoURI || error) {
    return (
      <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
        {symbol?.[0] ?? '?'}
      </div>
    )
  }
  return (
    <img
      src={logoURI}
      alt={symbol}
      className="w-9 h-9 rounded-full bg-surface shrink-0 object-cover"
      onError={() => setError(true)}
    />
  )
}

const FILTER_LEVELS = ['ALL', 'HIGH RISK', 'CAUTION', 'SAFE']
const SORT_OPTIONS = [
  { value: 'score', label: 'RugScore' },
  { value: 'age', label: 'Age' },
  { value: 'liquidity', label: 'Liquidity' },
]
const FILTER_ACTIVE = {
  ALL: 'bg-accent border-accent text-white',
  'HIGH RISK': 'bg-risk border-risk text-white',
  CAUTION: 'bg-caution border-caution text-black',
  SAFE: 'bg-safe border-safe text-black',
}
const SIGNAL_ICONS = [Flame, Users, Snowflake, Droplets, Clock, BarChart2]

// Mobile-only card — replaces table row on small screens
function MobileTokenCard({ token, expanded, onToggle }) {
  const navigate = useNavigate()
  const { address, name, symbol, logoURI, age, liquidity, volume24h, rugScore } = token
  const { score = 0, level = 'SAFE', signals = [] } = rugScore || {}

  const borderColor =
    level === 'HIGH RISK' ? 'border-l-risk' : level === 'CAUTION' ? 'border-l-caution' : 'border-l-safe'
  const bgColor =
    level === 'HIGH RISK' ? 'bg-red-950/30' : level === 'CAUTION' ? 'bg-amber-950/20' : ''
  const glow = level === 'HIGH RISK' ? 'risk-glow' : ''

  return (
    <div className={`border border-border border-l-2 ${borderColor} ${bgColor} ${glow} rounded mb-2`}>
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 p-3 text-left min-h-[56px]"
        onClick={onToggle}
      >
        <MobileTokenLogo logoURI={logoURI} symbol={symbol} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-primary truncate">{name ?? 'Unknown'}</div>
          <div className="text-[11px] text-muted">{symbol} · {truncateAddr(address)}</div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <RugScoreBadge score={score} level={level} />
          {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </button>

      {/* Stats row */}
      <div className="flex text-[11px] border-t border-border/50 divide-x divide-border/50">
        <div className="flex-1 px-3 py-2">
          <div className="text-muted text-[9px] tracking-widest">AGE</div>
          <div className="text-primary">{formatAge(age)}</div>
        </div>
        <div className="flex-1 px-3 py-2">
          <div className="text-muted text-[9px] tracking-widest">LIQ</div>
          <div className={liquidity != null && liquidity < 10000 ? 'text-risk font-bold' : 'text-primary'}>
            {formatDollar(liquidity)}
          </div>
        </div>
        <div className="flex-1 px-3 py-2">
          <div className="text-muted text-[9px] tracking-widest">VOL</div>
          <div className={!volume24h ? 'text-risk' : 'text-primary'}>{formatDollar(volume24h)}</div>
        </div>
        <div className="flex items-center px-3 gap-1">
          {signals.filter(s => s.triggered).map((sig, i) => {
            const Icon = SIGNAL_ICONS[signals.indexOf(sig)]
            return Icon ? <Icon key={i} size={12} className="text-risk" /> : null
          })}
        </div>
      </div>

      {/* Expandable signals */}
      {expanded && (
        <div className="border-t border-border/50 p-3 space-y-1.5">
          <div className="text-[10px] text-muted tracking-widest mb-2">WHY RISKY?</div>
          {signals.map((sig, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded border ${sig.triggered ? 'border-risk/40 bg-risk/10 text-risk' : 'border-border/40 text-muted opacity-60'}`}>
              {sig.triggered ? '⚠' : '✓'} {sig.label}
              {sig.triggered && <span className="ml-auto font-bold">+{sig.points}</span>}
            </div>
          ))}
        </div>
      )}

      {/* VIEW button */}
      <div className="border-t border-border/50 p-2">
        <button
          onClick={() => navigate(`/token/${address}`)}
          className="w-full min-h-[44px] text-xs font-bold border border-accent text-accent hover:bg-accent hover:text-white rounded transition-colors"
        >
          VIEW TOKEN DETAILS →
        </button>
      </div>
    </div>
  )
}

export default function LiveFeed() {
  const { tokens, loading, refreshing, error, lastUpdated, refresh } = useNewListings(60000)

  const [filterLevel, setFilterLevel] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [expandedRow, setExpandedRow] = useState(null)
  const [pipelineStep, setPipelineStep] = useState(-1)

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

  const emptyContent = loading ? (
    <Skeleton rows={6} />
  ) : error ? (
    <div className="border border-risk/40 bg-risk/10 rounded p-8 text-center max-w-lg mx-auto">
      <div className="text-risk font-bold text-sm mb-2 tracking-widest">⚠ FEED UNAVAILABLE</div>
      <div className="text-muted text-xs mb-4">{error}</div>
      <div className="text-muted text-xs mb-4">Ensure backend is running on port 4000 with BIRDEYE_API_KEY set.</div>
      <button onClick={refresh} className="text-xs text-accent border border-accent px-4 py-2.5 min-h-[44px] rounded hover:bg-accent hover:text-white transition-colors">
        ↻ Retry
      </button>
    </div>
  ) : filtered.length === 0 ? (
    <div className="text-center py-20">
      <div className="text-muted text-sm tracking-widest blink">NO TOKENS DETECTED</div>
      <div className="text-muted text-xs mt-3 opacity-50">
        {tokens.length > 0 ? 'No tokens match the current filter.' : 'Waiting for new Solana listings...'}
      </div>
    </div>
  ) : null

  return (
    <div className="min-h-screen flex flex-col">
      <PipelineVisualizer activeStep={pipelineStep} />
      <StatsBar totalScanned={totalScanned} highRiskCount={highRiskCount} rugsCount={rugsCount} lastUpdated={lastUpdated} />

      {/* Filter bar */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-surface flex flex-wrap items-center gap-2">
        <div className="flex gap-1 flex-wrap">
          {FILTER_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`text-[11px] px-3 py-2 min-h-[40px] rounded border tracking-wider transition-colors whitespace-nowrap ${
                filterLevel === level ? FILTER_ACTIVE[level] : 'border-border text-muted hover:text-primary'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border border-border rounded px-2 bg-bg flex-1 min-w-[140px] max-w-xs min-h-[40px]">
          <Search size={12} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-primary placeholder-muted outline-none py-1.5 w-full"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs bg-bg border border-border text-primary rounded px-2 min-h-[40px] outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>Sort: {o.label}</option>
          ))}
        </select>

        <button
          onClick={refresh}
          disabled={refreshing}
          className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-primary border border-border px-3 min-h-[40px] rounded hover:border-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-4 flex-1">
        {emptyContent ? (
          emptyContent
        ) : (
          <>
            {/* Mobile cards (< md) */}
            <div className="md:hidden">
              {filtered.map((token) => (
                <MobileTokenCard
                  key={token.address}
                  token={token}
                  expanded={expandedRow === token.address}
                  onToggle={() => setExpandedRow(expandedRow === token.address ? null : token.address)}
                />
              ))}
            </div>

            {/* Desktop table (md+) */}
            <div className="hidden md:block overflow-x-auto rounded border border-border">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    {['TOKEN', 'AGE', 'LIQUIDITY', 'VOL 24H', 'FLAGS', 'RUGSCORE', 'ACTION'].map((col) => (
                      <th key={col} className="py-2 px-3 text-left text-[10px] text-muted tracking-widest font-normal uppercase">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((token) => (
                    <TokenRow
                      key={token.address}
                      token={token}
                      expanded={expandedRow === token.address}
                      onToggle={() => setExpandedRow(expandedRow === token.address ? null : token.address)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-muted text-[11px] py-5 border-t border-border tracking-widest">
        Auto-refreshing every 30s &nbsp;·&nbsp; Powered by <span className="text-accent">Birdeye Data</span>
      </div>
    </div>
  )
}
