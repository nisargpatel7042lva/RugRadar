import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Share2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useTokenDetail } from '../hooks/useBirdeye'
import RiskMeter from '../components/RiskMeter'
import SignalBreakdown from '../components/SignalBreakdown'
import HolderChart from '../components/HolderChart'
import TransactionList from '../components/TransactionList'
import RugScoreBadge from '../components/RugScoreBadge'
import Skeleton from '../components/Skeleton'
import { formatDollar, formatPrice, formatAge, truncateAddr } from '../utils/format'

function StatCard({ label, value, valueClass = 'text-primary' }) {
  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col gap-1">
      <div className="text-[10px] text-muted tracking-widest uppercase">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${valueClass}`}>{value ?? '—'}</div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-muted hover:text-primary transition-colors p-1"
      title="Copy address"
    >
      {copied ? <Check size={13} className="text-safe" /> : <Copy size={13} />}
    </button>
  )
}

export default function TokenDeepDive() {
  const { address } = useParams()
  const navigate = useNavigate()
  const { token, loading, error } = useTokenDetail(address)
  const [reportSent, setReportSent] = useState(false)

  const score = token?.rugScore?.score ?? 0
  const level = token?.rugScore?.level ?? 'SAFE'
  const signals = token?.rugScore?.signals ?? []
  const top10Percent = token?.security?.top10HolderPercent ?? 0
  const hasLimitedData = !token?.price && !token?.marketCap && !token?.liquidity
  const displayName = (token?.name && token.name !== 'Unknown')
    ? token.name
    : (token?.symbol && token.symbol !== '???')
      ? token.symbol
      : truncateAddr(address)

  function handleShare() {
    const msg = `🚨 This token scored ${score}/100 on RugRadar: https://rugradar.vercel.app/token/${address}`
    navigator.clipboard.writeText(msg)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="h-8 w-32 shimmer rounded mb-6" />
        <div className="h-16 shimmer rounded mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 shimmer rounded" />)}
        </div>
        <Skeleton rows={8} />
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-risk font-bold text-sm tracking-widest mb-2">
          TOKEN DATA UNAVAILABLE
        </div>
        <div className="text-muted text-xs mb-6">{error ?? 'Unknown error'}</div>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-accent border border-accent px-4 py-2 rounded hover:bg-accent hover:text-white transition-colors"
        >
          ← Back to Live Feed
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 animate-fade-in-up">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-5"
      >
        <ArrowLeft size={14} />
        Back to Live Feed
      </button>

      {/* Token header */}
      <div className="flex items-start gap-4 mb-6 p-4 bg-surface border border-border rounded">
        {token.logoURI ? (
          <img
            src={token.logoURI}
            alt={token.symbol}
            className="w-12 h-12 rounded-full bg-bg shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg shrink-0">
            {token.symbol?.[0] ?? '?'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-primary">{displayName}</h1>
            <span className="text-muted text-sm">{token.symbol}</span>
            <RugScoreBadge score={score} level={level} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-muted font-mono">{address}</span>
            <CopyButton text={address} />
          </div>
          {token.age != null && (
            <div className="text-[11px] text-muted mt-0.5">
              Age: <span className="text-primary">{formatAge(token.age)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Data restriction notice */}
      {hasLimitedData && (
        <div className="flex items-start gap-2 px-4 py-3 mb-4 border border-caution/40 bg-caution/5 rounded text-xs text-caution">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>
            Market data is unavailable for this token — it may be too new or not yet indexed by Birdeye.
            Risk signals are computed from on-chain security data only.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Price"
          value={token.price ? formatPrice(token.price) : 'N/A'}
          valueClass="text-accent"
        />
        <StatCard
          label="Market Cap"
          value={token.marketCap ? formatDollar(token.marketCap) : 'N/A'}
        />
        <StatCard
          label="Liquidity"
          value={token.liquidity ? formatDollar(token.liquidity) : 'N/A'}
          valueClass={token.liquidity && token.liquidity < 10000 ? 'text-risk' : 'text-primary'}
        />
        <StatCard
          label="24h Volume"
          value={token.volume24h ? formatDollar(token.volume24h) : 'N/A'}
          valueClass={!token.volume24h || token.volume24h === 0 ? 'text-risk' : 'text-primary'}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left column */}
        <div className="bg-surface border border-border rounded p-5 space-y-6">
          <div>
            <div className="text-[10px] text-muted tracking-widest mb-3 uppercase">
              Risk Meter
            </div>
            <RiskMeter score={score} />
          </div>

          <div className="border-t border-border pt-5">
            <SignalBreakdown signals={signals} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded p-5">
            <HolderChart top10Percent={top10Percent} />
          </div>

          <div className="bg-surface border border-border rounded p-5">
            <TransactionList transactions={token.transactions ?? []} />
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-surface border border-border rounded">
        <button
          onClick={() => setReportSent(true)}
          disabled={reportSent}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded border transition-colors ${
            reportSent
              ? 'border-safe/40 text-safe bg-safe/10 cursor-default'
              : 'border-border text-muted hover:border-safe hover:text-safe'
          }`}
        >
          <ShieldCheck size={13} />
          {reportSent ? 'Reported as Safe' : 'Report as Safe'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded border border-border text-muted hover:border-accent hover:text-accent transition-colors"
          title="Copy share text to clipboard"
        >
          <Share2 size={13} />
          Share Alert
        </button>

        <div className="ml-auto text-[11px] text-muted hidden sm:block">
          Share: <span className="text-muted/50 font-mono">🚨 This token scored {score}/100 on RugRadar</span>
        </div>
      </div>
    </div>
  )
}
