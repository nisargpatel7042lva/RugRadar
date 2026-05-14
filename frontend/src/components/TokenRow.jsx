import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Flame, Users, Snowflake, Droplets, Clock, BarChart2 } from 'lucide-react'
import RugScoreBadge from './RugScoreBadge'
import { formatAge, formatDollar, truncateAddr } from '../utils/format'

const SIGNAL_ICONS = [Flame, Users, Snowflake, Droplets, Clock, BarChart2]

function TokenLogo({ logoURI, symbol, sizeClass = 'w-7 h-7' }) {
  const [error, setError] = useState(false)
  if (!logoURI || error) {
    return (
      <div className={`${sizeClass} rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0`}>
        {symbol?.[0] ?? '?'}
      </div>
    )
  }
  return (
    <img
      src={logoURI}
      alt={symbol}
      className={`${sizeClass} rounded-full bg-surface shrink-0 object-cover`}
      onError={() => setError(true)}
    />
  )
}

export default function TokenRow({ token, expanded, onToggle }) {
  const navigate = useNavigate()
  const { address, name, symbol, logoURI, age, liquidity, volume24h, rugScore } = token
  const { score = 0, level = 'SAFE', signals = [] } = rugScore || {}

  const triggeredSignals = signals.filter((s) => s.triggered)

  let rowClass = 'border-l-2 border-l-safe bg-transparent'
  if (level === 'HIGH RISK') rowClass = 'border-l-2 border-l-risk bg-red-950/30 risk-glow'
  else if (level === 'CAUTION') rowClass = 'border-l-2 border-l-caution bg-amber-950/20'

  return (
    <>
      <tr
        className={`${rowClass} border-b border-border cursor-pointer hover:brightness-110 transition-all duration-150`}
        onClick={onToggle}
      >
        {/* TOKEN */}
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <TokenLogo logoURI={logoURI} symbol={symbol} />
            <div className="min-w-0">
              <div className="font-bold text-sm text-primary truncate max-w-[130px]">
                {name ?? 'Unknown'}
              </div>
              <div className="text-[11px] text-muted">
                {symbol} · {truncateAddr(address)}
              </div>
            </div>
          </div>
        </td>

        {/* AGE */}
        <td className="py-3 px-3 text-xs text-muted tabular-nums whitespace-nowrap">
          {formatAge(age)}
        </td>

        {/* LIQUIDITY */}
        <td className="py-3 px-3 text-xs tabular-nums whitespace-nowrap">
          <span className={liquidity != null && liquidity < 10000 ? 'text-risk font-bold' : 'text-primary'}>
            {formatDollar(liquidity)}
          </span>
        </td>

        {/* VOLUME 24H */}
        <td className="py-3 px-3 text-xs tabular-nums whitespace-nowrap">
          <span className={!volume24h || volume24h === 0 ? 'text-risk' : 'text-primary'}>
            {formatDollar(volume24h)}
          </span>
        </td>

        {/* RUG FLAGS */}
        <td className="py-3 px-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {triggeredSignals.length === 0 ? (
              <span className="text-safe text-[10px] tracking-wider">CLEAR</span>
            ) : (
              signals.map((sig, i) =>
                sig.triggered ? (
                  <span key={i} title={sig.label} className="text-risk">
                    {SIGNAL_ICONS[i] && (() => { const Icon = SIGNAL_ICONS[i]; return <Icon size={13} /> })()}
                  </span>
                ) : null
              )
            )}
          </div>
        </td>

        {/* RUGSCORE */}
        <td className="py-3 px-3 whitespace-nowrap">
          <RugScoreBadge score={score} level={level} />
        </td>

        {/* ACTION */}
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <button
              className="text-[11px] px-2.5 py-1 border border-accent text-accent hover:bg-accent hover:text-white rounded transition-colors whitespace-nowrap"
              onClick={(e) => { e.stopPropagation(); navigate(`/token/${address}`) }}
            >
              VIEW
            </button>
            <span className="text-muted">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </td>
      </tr>

      {/* Expandable: WHY RISKY? */}
      {expanded && (
        <tr className="border-b border-border">
          <td colSpan={7} className="px-4 py-3 bg-surface/60">
            <div className="text-[10px] text-muted tracking-widest mb-2 uppercase">
              Why Risky? — {triggeredSignals.length}/{signals.length} signals triggered
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {signals.map((sig, i) => {
                const Icon = SIGNAL_ICONS[i]
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded border text-xs transition-all ${
                      sig.triggered
                        ? 'border-risk/40 bg-risk/10 text-risk'
                        : 'border-border/50 text-muted opacity-60'
                    }`}
                  >
                    {Icon && <Icon size={11} className="shrink-0" />}
                    <span className="flex-1 leading-tight">{sig.label}</span>
                    {sig.triggered && (
                      <span className="ml-auto font-bold text-risk shrink-0">+{sig.points}</span>
                    )}
                    {!sig.triggered && <span className="ml-auto text-safe shrink-0">✓</span>}
                  </div>
                )
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
