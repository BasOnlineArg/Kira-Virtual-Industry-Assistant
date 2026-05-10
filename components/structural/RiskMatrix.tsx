'use client'

import { cn } from '@/lib/utils'
import { riskScore, riskLevel, RISK_SCALE_LABELS } from '@/lib/structural/constants'

interface RiskMatrixProps {
  criticidad: number
  frecuencia: number
  impacto: number
  onCriticidad: (v: number) => void
  onFrecuencia: (v: number) => void
  onImpacto: (v: number) => void
  disabled?: boolean
}

function ScaleSelector({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <span className="text-sm font-mono font-bold text-slate-200">{value || '—'}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => {
          const level = riskLevel(v * v * v) // approximate color per value
          const isSelected = value === v
          return (
            <button
              key={v}
              onClick={() => onChange(value === v ? 0 : v)}
              disabled={disabled}
              title={RISK_SCALE_LABELS[v]}
              className={cn(
                'flex-1 h-8 rounded-lg text-xs font-bold border transition-all',
                isSelected
                  ? cn(level.color, 'text-white border-transparent scale-105')
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              )}
            >
              {v}
            </button>
          )
        })}
      </div>
      {value > 0 && (
        <p className="text-[10px] text-slate-600">{RISK_SCALE_LABELS[value]}</p>
      )}
    </div>
  )
}

export default function RiskMatrix({
  criticidad, frecuencia, impacto,
  onCriticidad, onFrecuencia, onImpacto,
  disabled,
}: RiskMatrixProps) {
  const score = (criticidad && frecuencia && impacto)
    ? riskScore(criticidad, frecuencia, impacto)
    : 0
  const level = riskLevel(score)

  return (
    <div className="space-y-4">
      <ScaleSelector label="Criticidad del activo" value={criticidad} onChange={onCriticidad} disabled={disabled} />
      <ScaleSelector label="Frecuencia de falla"   value={frecuencia} onChange={onFrecuencia} disabled={disabled} />
      <ScaleSelector label="Impacto de la falla"   value={impacto}    onChange={onImpacto}    disabled={disabled} />

      {/* Score display */}
      {score > 0 && (
        <div className={cn('flex items-center justify-between p-3 rounded-xl border', level.bg)}>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Score de riesgo</p>
            <p className="text-[10px] text-slate-600">C × F × I = {criticidad} × {frecuencia} × {impacto}</p>
          </div>
          <div className="text-right">
            <p className={cn('text-2xl font-mono font-bold', level.textColor)}>{score}</p>
            <p className={cn('text-[10px] font-semibold uppercase', level.textColor)}>{level.label}</p>
            <p className="text-[10px] text-slate-600">/ 125</p>
          </div>
        </div>
      )}

      {/* Risk matrix legend */}
      <div className="grid grid-cols-4 gap-1 text-[9px]">
        {[
          { range: '1–25',   label: 'Bajo',    color: 'bg-emerald-500/20 text-emerald-400' },
          { range: '26–50',  label: 'Medio',   color: 'bg-amber-500/20 text-amber-400' },
          { range: '51–75',  label: 'Alto',    color: 'bg-orange-500/20 text-orange-400' },
          { range: '76–125', label: 'Crítico', color: 'bg-red-500/20 text-red-400' },
        ].map((r) => (
          <div key={r.label} className={cn('px-1.5 py-1 rounded text-center font-semibold', r.color)}>
            <div>{r.label}</div>
            <div className="font-normal opacity-70">{r.range}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
