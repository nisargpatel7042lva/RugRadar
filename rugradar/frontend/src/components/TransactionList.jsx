import { AlertTriangle } from 'lucide-react'
import { truncateAddr } from '../utils/format'

function formatTime(unixTime) {
  if (!unixTime) return '—'
  return new Date(unixTime * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatAmount(tx) {
  const usd = tx.volumeUSD ?? tx.volume ?? tx.amount ?? 0
  if (!usd) return '$0'
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`
  if (usd >= 1e3) return `$${(usd / 1e3).toFixed(1)}K`
  return `$${Number(usd).toFixed(2)}`
}

export default function TransactionList({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div>
        <div className="text-[10px] text-muted tracking-widest mb-2 uppercase">
          Recent Transactions
        </div>
        <div className="border border-border rounded py-8 text-center text-muted text-xs tracking-wider">
          NO TRANSACTIONS FOUND
        </div>
      </div>
    )
  }

  const hasSuspicious = transactions.some((tx) => tx.suspicious)

  return (
    <div>
      <div className="text-[10px] text-muted tracking-widest mb-2 uppercase">
        Recent Transactions
      </div>

      {hasSuspicious && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 border border-risk/50 bg-risk/10 rounded text-xs text-risk font-bold tracking-wider">
          <AlertTriangle size={13} />
          SUSPICIOUS ACTIVITY DETECTED
        </div>
      )}

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['TIME', 'TYPE', 'AMOUNT', 'WALLET', '⚠'].map((col) => (
                <th
                  key={col}
                  className="py-2 px-2 text-left text-[10px] text-muted tracking-widest font-normal uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => {
              const isBuy = (tx.side ?? tx.type ?? '').toLowerCase() === 'buy'
              const wallet =
                tx.owner ?? tx.maker ?? tx.source ?? tx.wallet ?? ''
              const time = tx.blockUnixTime ?? tx.timestamp

              return (
                <tr
                  key={i}
                  className={`border-b border-border last:border-0 ${
                    isBuy ? 'bg-safe/5' : 'bg-risk/5'
                  } ${tx.suspicious ? 'ring-1 ring-inset ring-risk/30' : ''}`}
                >
                  <td className="py-2 px-2 text-muted tabular-nums whitespace-nowrap">
                    {formatTime(time)}
                  </td>
                  <td
                    className={`py-2 px-2 font-bold tracking-wider text-[11px] ${
                      isBuy ? 'text-safe' : 'text-risk'
                    }`}
                  >
                    {isBuy ? 'BUY' : 'SELL'}
                  </td>
                  <td className="py-2 px-2 text-primary tabular-nums whitespace-nowrap">
                    {formatAmount(tx)}
                  </td>
                  <td className="py-2 px-2 text-muted font-mono">
                    {truncateAddr(wallet) || '—'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {tx.suspicious && (
                      <span title="Suspicious: >3 txs from this wallet in 60s">
                        <AlertTriangle size={12} className="text-caution inline" />
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
