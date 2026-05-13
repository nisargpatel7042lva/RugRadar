import { Loader2, CheckCircle2, Circle } from 'lucide-react'

const STEPS = [
  'NEW LISTING',
  'SECURITY',
  'LIQUIDITY',
  'HOLDERS',
  'TRANSACTIONS',
  'RUGSCORE™',
]

function Step({ label, index, activeStep }) {
  const isDone = index < activeStep
  const isActive = index === activeStep
  const isPending = index > activeStep

  let borderColor = 'border-border'
  let textColor = 'text-muted'
  let glow = ''

  if (isDone) {
    borderColor = 'border-safe'
    textColor = 'text-safe'
    glow = 'safe-glow'
  } else if (isActive) {
    borderColor = 'border-accent'
    textColor = 'text-accent'
    glow = 'terminal-glow'
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 border rounded min-w-[90px] bg-surface transition-all duration-300 ${borderColor} ${glow}`}
    >
      <div className={`flex items-center gap-1 ${textColor}`}>
        {isDone && <CheckCircle2 size={12} className="shrink-0" />}
        {isActive && (
          <Loader2 size={12} className="shrink-0 animate-spin" />
        )}
        {isPending && <Circle size={12} className="shrink-0 opacity-30" />}
      </div>
      <span className={`text-[9px] tracking-widest font-bold uppercase ${textColor} text-center leading-tight`}>
        {label}
      </span>
    </div>
  )
}

function Arrow({ completed }) {
  return (
    <div className={`flex-shrink-0 mx-1 text-sm font-bold ${completed ? 'text-safe' : 'text-border'}`}>
      →
    </div>
  )
}

export default function PipelineVisualizer({ activeStep = -1 }) {
  return (
    <div className="w-full bg-surface border border-border px-4 py-3 overflow-x-auto">
      <div className="flex items-center min-w-max mx-auto w-fit">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center">
            <Step label={step} index={i} activeStep={activeStep} />
            {i < STEPS.length - 1 && <Arrow completed={i < activeStep} />}
          </div>
        ))}
      </div>
    </div>
  )
}
