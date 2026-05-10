'use client'

import type { TimelineEvent } from './types'

const TYPE_CFG: Record<string, { color: string; bg: string; label: string }> = {
  inicio:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  label: 'Inicio'   },
  escalada: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  label: 'Escalada' },
  critico:  { color: '#f87171', bg: 'rgba(248,113,113,0.08)', label: 'Crítico'  },
  fin:      { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  label: 'Fin'      },
}

export default function TimelineView({ events }: { events: TimelineEvent[] }) {
  if (!events?.length) return null

  return (
    <div className="px-4 pb-3 mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-3">
        Línea de tiempo
      </p>
      <div className="relative">
        {/* Track */}
        <div className="absolute left-5 right-5 top-[9px] h-px bg-slate-700/70" />

        <div className="flex gap-2 overflow-x-auto pb-2 items-start">
          {events.map((ev, i) => {
            const cfg = TYPE_CFG[ev.tipo] ?? TYPE_CFG.escalada
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 min-w-[88px] max-w-[110px]">
                {/* Dot */}
                <div
                  className="w-[18px] h-[18px] rounded-full z-10 shrink-0 ring-2 ring-slate-950"
                  style={{ backgroundColor: cfg.color }}
                />
                {/* Card */}
                <div
                  className="rounded-xl p-2 text-center w-full"
                  style={{
                    backgroundColor: cfg.bg,
                    border: `1px solid ${cfg.color}35`,
                  }}
                >
                  <p className="text-[9px] font-bold mb-0.5 leading-tight" style={{ color: cfg.color }}>
                    {ev.momento}
                  </p>
                  <p className="text-[8px] leading-tight" style={{ color: '#94a3b8' }}>
                    {ev.descripcion}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
