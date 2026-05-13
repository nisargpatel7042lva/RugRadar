import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#ef4444', '#6366f1']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-xs font-mono">
      <div className="text-primary font-bold">{payload[0].name}</div>
      <div className="text-muted">{payload[0].value}%</div>
    </div>
  )
}

export default function HolderChart({ top10Percent }) {
  const top10 = top10Percent != null ? Number((top10Percent * 100).toFixed(1)) : 0
  const other = Number((100 - top10).toFixed(1))

  const data = [
    { name: 'Top 10 Holders', value: top10 || 0.1 },
    { name: 'Others', value: other || 0.1 },
  ]

  return (
    <div>
      <div className="text-[10px] text-muted tracking-widest mb-2 uppercase">
        Holder Distribution
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label inside donut */}
        <div className="absolute inset-0 flex items-center justify-center pb-8 pointer-events-none">
          <div className="text-center">
            <div className="text-[10px] text-muted tracking-wider">TOP 10</div>
            <div
              className={`text-xl font-bold tabular-nums ${
                top10 > 60 ? 'text-risk' : top10 > 40 ? 'text-caution' : 'text-safe'
              }`}
            >
              {top10}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
