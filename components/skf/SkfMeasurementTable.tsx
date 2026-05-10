'use client'

import { cn } from '@/lib/utils'

// ISO 10816 zone thresholds by class (mm/s): [A/B, B/C, C/D]
const ISO_THRESHOLDS: Record<string, [number, number, number]> = {
  I:   [1.12, 2.8,  7.1],
  II:  [2.8,  7.1,  18],
  III: [4.5,  11.2, 28],
  IV:  [7.1,  18,   45],
}

export interface SkfPoint {
  punto: string
  velocityRms: number
  envelopeGe: number
  temperatura: number
  fecha?: string
}

function getZone(v: number, cls: string): 'A' | 'B' | 'C' | 'D' {
  const [ab, bc, cd] = ISO_THRESHOLDS[cls] ?? ISO_THRESHOLDS['II']
  if (v <= ab) return 'A'
  if (v <= bc) return 'B'
  if (v <= cd) return 'C'
  return 'D'
}

function getEstado(zone: 'A' | 'B' | 'C' | 'D') {
  if (zone === 'A') return 'verde'
  if (zone === 'B') return 'amarillo'
  return 'rojo'
}

const ZONE_STYLE = {
  A: { dot: 'bg-emerald-400', bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  B: { dot: 'bg-amber-400',   bar: 'bg-amber-400',   text: 'text-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  C: { dot: 'bg-orange-500',  bar: 'bg-orange-500',  text: 'text-orange-400',  badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  D: { dot: 'bg-red-500',     bar: 'bg-red-600',     text: 'text-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const ZONE_LABEL = { A: 'Zona A', B: 'Zona B', C: 'Zona C', D: 'Zona D' }
const ZONE_DESC  = { A: 'Excelente', B: 'Aceptable', C: 'Insatisfactorio', D: 'Crítico' }

function VelocityBar({ value, isoClass }: { value: number; isoClass: string }) {
  const [, , cd] = ISO_THRESHOLDS[isoClass] ?? ISO_THRESHOLDS['II']
  const maxScale = cd * 1.4
  const pct = Math.min(100, (value / maxScale) * 100)
  const zone = getZone(value, isoClass)
  const style = ZONE_STYLE[zone]

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', style.bar)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('text-xs font-mono font-semibold w-12 text-right', style.text)}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function EnvelopeIndicator({ value }: { value: number }) {
  const color =
    value < 0.5 ? 'text-emerald-400' :
    value < 1.0 ? 'text-amber-400' :
    value < 5.0 ? 'text-orange-400' : 'text-red-400'
  return <span className={cn('text-xs font-mono font-semibold', color)}>{value.toFixed(3)}</span>
}

function TempIndicator({ value }: { value: number }) {
  const color = value > 80 ? 'text-red-400' : value > 65 ? 'text-orange-400' : 'text-slate-300'
  return <span className={cn('text-xs font-mono', color)}>{value.toFixed(1)}</span>
}

interface SkfMeasurementTableProps {
  points: SkfPoint[]
  isoClass: string
  assetTag: string
  fecha?: string
}

export default function SkfMeasurementTable({ points, isoClass, assetTag, fecha }: SkfMeasurementTableProps) {
  if (points.length === 0) return null

  const worstZone = points.reduce<'A' | 'B' | 'C' | 'D'>((worst, p) => {
    const z = getZone(p.velocityRms, isoClass)
    const order = { A: 0, B: 1, C: 2, D: 3 }
    return order[z] > order[worst] ? z : worst
  }, 'A')

  const worstEstado = getEstado(worstZone)

  return (
    <div className="space-y-4">
      {/* QuickCollect-style header */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        {/* Header bar — mimics QuickCollect app */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            {/* SKF logo shape */}
            <div className="w-8 h-8 rounded-lg bg-[#005CB9] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-white tracking-tight">SKF</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{assetTag}</p>
              <p className="text-[10px] text-slate-500">
                {fecha ? new Date(fecha).toLocaleString('es-AR') : 'QuickCollect'} · ISO Clase {isoClass}
              </p>
            </div>
          </div>
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold', ZONE_STYLE[worstZone].badge)}>
            <div className={cn('w-2 h-2 rounded-full', ZONE_STYLE[worstZone].dot)} />
            {ZONE_LABEL[worstZone]} — {ZONE_DESC[worstZone]}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-4 py-2 border-b border-slate-700/30 bg-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Punto</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vel. RMS (mm/s)</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Env. (gE)</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Temp (°C)</span>
        </div>

        {/* Point rows */}
        <div className="divide-y divide-slate-700/20">
          {points.map((p, i) => {
            const zone = getZone(p.velocityRms, isoClass)
            const style = ZONE_STYLE[zone]
            return (
              <div key={i} className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-4 py-3 items-center hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', style.dot)} />
                  <span className="text-xs text-slate-200 font-medium truncate">{p.punto}</span>
                </div>
                <VelocityBar value={p.velocityRms} isoClass={isoClass} />
                <EnvelopeIndicator value={p.envelopeGe} />
                <TempIndicator value={p.temperatura} />
              </div>
            )
          })}
        </div>

        {/* Footer summary */}
        <div className="px-4 py-3 bg-slate-800/40 border-t border-slate-700/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              {
                label: 'Vel. máx',
                value: `${Math.max(...points.map((p) => p.velocityRms)).toFixed(2)} mm/s`,
                color: ZONE_STYLE[getZone(Math.max(...points.map((p) => p.velocityRms)), isoClass)].text,
              },
              {
                label: 'Env. máx',
                value: `${Math.max(...points.map((p) => p.envelopeGe)).toFixed(3)} gE`,
                color: Math.max(...points.map((p) => p.envelopeGe)) > 1 ? 'text-amber-400' : 'text-emerald-400',
              },
              {
                label: 'Temp. máx',
                value: `${Math.max(...points.map((p) => p.temperatura)).toFixed(1)} °C`,
                color: Math.max(...points.map((p) => p.temperatura)) > 80 ? 'text-red-400' : 'text-slate-300',
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={cn('text-sm font-mono font-semibold mt-0.5', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone legend */}
      <div className="flex gap-3 flex-wrap">
        {(Object.entries(ZONE_STYLE) as [string, typeof ZONE_STYLE[keyof typeof ZONE_STYLE]][]).map(([z, s]) => (
          <div key={z} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', s.dot)} />
            <span className="text-[10px] text-slate-500">
              {ZONE_LABEL[z as keyof typeof ZONE_LABEL]} — {ZONE_DESC[z as keyof typeof ZONE_DESC]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export helpers for use in other components
export { getZone, getEstado, ISO_THRESHOLDS }
