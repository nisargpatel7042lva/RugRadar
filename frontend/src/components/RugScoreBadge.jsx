export default function RugScoreBadge({ score, level }) {
  const config = {
    'HIGH RISK': {
      bg: 'bg-risk',
      text: 'text-white',
      extra: 'risk-glow animate-pulse',
    },
    CAUTION: {
      bg: 'bg-caution',
      text: 'text-black',
      extra: '',
    },
    SAFE: {
      bg: 'bg-safe',
      text: 'text-black',
      extra: '',
    },
  }

  const { bg, text, extra } = config[level] ?? config['SAFE']

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider ${bg} ${text} ${extra}`}
    >
      <span>{score}</span>
      <span className="opacity-70">/100</span>
      <span className="ml-0.5">{level}</span>
    </span>
  )
}
