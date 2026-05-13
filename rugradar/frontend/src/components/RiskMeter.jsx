import { useState, useEffect } from 'react'

export default function RiskMeter({ score }) {
  const [animScore, setAnimScore] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 80)
    return () => clearTimeout(t)
  }, [score])

  const r = 80
  const cx = 100
  const cy = 100
  const circumference = 2 * Math.PI * r   // ≈ 502.65
  const halfCirc = circumference / 2       // ≈ 251.33

  // Arc length filled based on animated score
  const filled = (animScore / 100) * halfCirc

  let color = '#22c55e'
  if (score > 60) color = '#ef4444'
  else if (score > 30) color = '#f59e0b'

  // dashoffset=halfCirc shifts start point from 3-o'clock → 9-o'clock (left)
  // so the arc fills left → top → right as score increases
  const trackProps = {
    cx, cy, r,
    fill: 'none',
    stroke: '#1e1e3a',
    strokeWidth: 14,
    strokeDasharray: `${halfCirc} ${circumference}`,
    strokeDashoffset: halfCirc,
    strokeLinecap: 'round',
  }

  const fillProps = {
    cx, cy, r,
    fill: 'none',
    stroke: color,
    strokeWidth: 14,
    strokeDasharray: `${filled} ${circumference}`,
    strokeDashoffset: halfCirc,
    strokeLinecap: 'round',
    style: { transition: 'stroke-dasharray 1s ease-out, stroke 0.4s ease' },
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-xs">
        <circle {...trackProps} />
        <circle {...fillProps} />
        <text
          x={cx}
          y={90}
          textAnchor="middle"
          fill={color}
          fontSize={42}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {score}
        </text>
        <text
          x={cx}
          y={112}
          textAnchor="middle"
          fill="#64748b"
          fontSize={10}
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="2"
        >
          RugScore™
        </text>
      </svg>
    </div>
  )
}
