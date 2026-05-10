'use client'

import { cn } from '@/lib/utils'

// ISO 10816 zone thresholds by class (mm/s)
const THRESHOLDS: Record<string, [number, number, number]> = {
  I:   [1.12, 2.8,  7.1],
  II:  [2.8,  7.1,  18],
  III: [4.5,  11.2, 28],
  IV:  [7.1,  18,   45],
}

const ZONE_LABELS = {
  A: { label: 'Zona A', desc: 'Nuevo / Excelente', color: 'bg-emerald-500', text: 'text-emerald-400' },
  B: { label: 'Zona B', desc: 'Aceptable', color: 'bg-amber-400',   text: 'text-amber-400' },
  C: { label: 'Zona C', desc: 'Insatisfactorio', color: 'bg-orange-500', text: 'text-orange-400' },
  D: { label: 'Zona D', desc: 'Peligroso', color: 'bg-red-600',    text: 'text-red-400' },
}

interface IsoGaugeProps {
  velocityRms: number
  isoClass: string
  zone: 'A' | 'B' | 'C' | 'D'
  estado: 'verde' | 'amarillo' | 'rojo'
}

export default function IsoGauge({ velocityRms, isoClass, zone, estado }: IsoGaugeProps) {
  const thresholds = THRESHOLDS[isoClass] ?? THRESHOLDS['II']
  const [ab, bc, cd] = thresholds
  const maxScale = cd * 1.4  // give some headroom past zone D

  // Percentage position of the needle on the bar
  const pct = Math.min(100, (velocityRms / maxScale) * 100)

  const zoneInfo = ZONE_LABELS[zone]

  const estadoConfig = {
    verde:    { dot: 'bg-emerald-400', label: 'OPERATIVO', ring: 'ring-emerald-500/40' },
    amarillo: { dot: 'bg-amber-400',   label: 'ALERTA',    ring: 'ring-amber-500/40' },
    rojo:     { dot: 'bg-red-500',     label: 'CRÍTICO',   ring: 'ring-red-500/40' },
  }[estado]

  return (
    <div className="space-y-4">
      {/* Semáforo status */}
      <div className={cn('flex items-center gap-3 p-3 rounded-xl border', {
        'border-emerald-500/30 bg-emerald-500/5': estado === 'verde',
        'border-amber-500/30 bg-amber-500/5':   estado === 'amarillo',
        'border-red-500/30 bg-red-500/5':       estado === 'rojo',
      })}>
        <div className={cn('w-4 h-4 rounded-full ring-4', estadoConfig.dot, estadoConfig.ring)} />
        <div>
          <p className="text-sm font-bold text-slate-100">{estadoConfig.label}</p>
          <p className="text-[10px] text-slate-500">
            {zoneInfo.label} — {zoneInfo.desc} · ISO 10816 Clase {isoClass}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-mono font-bold text-slate-100">{velocityRms.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500">mm/s RMS</p>
        </div>
      </div>

      {/* Zone bar */}
      <div>
        <div className="relative h-5 rounded-full overflow-hidden flex">
          {/* Zone A */}
          <div
            className="bg-emerald-500/80 h-full"
            style={{ width: `${(ab / maxScale) * 100}%` }}
          />
          {/* Zone B */}
          <div
            className="bg-amber-400/80 h-full"
            style={{ width: `${((bc - ab) / maxScale) * 100}%` }}
          />
          {/* Zone C */}
          <div
            className="bg-orange-500/80 h-full"
            style={{ width: `${((cd - bc) / maxScale) * 100}%` }}
          />
          {/* Zone D */}
          <div className="bg-red-600/80 h-full flex-1" />

          {/* Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="relative h-4 mt-0.5">
          <span className="absolute text-[9px] text-slate-600 left-0">0</span>
          <span
            className="absolute text-[9px] text-slate-600 -translate-x-1/2"
            style={{ left: `${(ab / maxScale) * 100}%` }}
          >{ab}</span>
          <span
            className="absolute text-[9px] text-slate-600 -translate-x-1/2"
            style={{ left: `${(bc / maxScale) * 100}%` }}
          >{bc}</span>
          <span
            className="absolute text-[9px] text-slate-600 -translate-x-1/2"
            style={{ left: `${(cd / maxScale) * 100}%` }}
          >{cd}</span>
          <span className="absolute text-[9px] text-slate-600 right-0">{maxScale.toFixed(0)}</span>
        </div>

        {/* Zone legend */}
        <div className="flex gap-3 mt-1 flex-wrap">
          {(Object.entries(ZONE_LABELS) as [string, typeof ZONE_LABELS[keyof typeof ZONE_LABELS]][]).map(([z, cfg]) => (
            <div key={z} className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full', cfg.color)} />
              <span className={cn('text-[9px]', zone === z ? cfg.text + ' font-semibold' : 'text-slate-600')}>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
