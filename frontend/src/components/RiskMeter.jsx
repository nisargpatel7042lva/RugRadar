import { useState, useEffect } from 'react'

export default function RiskMeter({ score = 0 }) {
  const [animScore, setAnimScore] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 100)
    return () => clearTimeout(t)
  }, [score])

  const r = 72
  const cx = 100
  const cy = 95
  const circumference = 2 * Math.PI * r
  const halfCirc = circumference / 2
  const filled = (animScore / 100) * halfCirc

  let color = '#22c55e'
  if (score > 60) color = '#ef4444'
  else if (score > 30) color = '#f59e0b'

  const level = score > 60 ? 'HIGH RISK' : score > 30 ? 'CAUTION' : 'SAFE'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-full max-w-[260px]">
        {/* Track: top semicircle, 9-o'clock to 3-o'clock */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={15}
          strokeDasharray={`${halfCirc} ${circumference}`}
          strokeDashoffset={halfCirc}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={15}
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={halfCirc}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease-out, stroke 0.4s ease' }}
        />

        {/* Score number */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          fill={color}
          fontSize={46}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {score}
        </text>

        {/* /100 sub-label */}
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          fill="#475569"
          fontSize={11}
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1"
        >
          / 100
        </text>

        {/* 0 at left endpoint */}
        <text
          x={cx - r + 6} y={cy + 24}
          textAnchor="middle"
          fill="#334155"
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          0
        </text>

        {/* 100 at right endpoint */}
        <text
          x={cx + r - 6} y={cy + 24}
          textAnchor="middle"
          fill="#334155"
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          100
        </text>
      </svg>

      {/* Risk level label below SVG */}
      <div
        className="text-[11px] font-bold tracking-[3px] -mt-3"
        style={{ color }}
      >
        {level}
      </div>
    </div>
  )
}
