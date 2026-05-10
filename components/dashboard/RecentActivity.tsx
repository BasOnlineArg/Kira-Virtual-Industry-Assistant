'use client'

import { ClipboardList, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentOT {
  id:          string
  otNumber:    string
  description: string
  status:      string
  fecha:       string
}

interface RecentAviso {
  id:          string
  tag:         string
  prioridad:   string
  descripcion: string
  fecha:       string
}

interface Props {
  ultimasOTs:     RecentOT[]
  ultimosAvisos:  RecentAviso[]
}

const OT_STATUS: Record<string, { label: string; cls: string }> = {
  cumplida:      { label: 'Cumplida',      cls: 'bg-emerald-500/15 text-emerald-400' },
  en_proceso:    { label: 'En proceso',    cls: 'bg-sky-500/15 text-sky-400'         },
  reprogramada:  { label: 'Reprogramada',  cls: 'bg-amber-500/15 text-amber-400'     },
  pendiente:     { label: 'Pendiente',     cls: 'bg-slate-600/50 text-slate-400'     },
  cancelada:     { label: 'Cancelada',     cls: 'bg-red-500/15 text-red-400'         },
}

const PRIORIDAD: Record<string, { cls: string }> = {
  MI:  { cls: 'bg-red-500/15 text-red-400'       },
  MN:  { cls: 'bg-sky-500/15 text-sky-400'        },
  PP:  { cls: 'bg-violet-500/15 text-violet-400'  },
  BKL: { cls: 'bg-amber-500/15 text-amber-400'    },
}

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short',
  })
}

export default function RecentActivity({ ultimasOTs, ultimosAvisos }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Last 5 Work Orders */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-4 h-4 text-sky-400" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Últimas Órdenes de Trabajo
          </h3>
        </div>

        {ultimasOTs.length === 0 ? (
          <p className="text-xs text-slate-600 py-4 text-center">Sin órdenes registradas</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-700/40">
            {ultimasOTs.map((o) => {
              const st = OT_STATUS[o.status] ?? { label: o.status, cls: 'bg-slate-600/50 text-slate-400' }
              return (
                <div key={o.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {o.otNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{o.description}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', st.cls)}>
                      {st.label}
                    </span>
                    <span className="text-[10px] text-slate-600">{fmtDate(o.fecha)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Last 5 Avisos */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Últimos Avisos
          </h3>
        </div>

        {ultimosAvisos.length === 0 ? (
          <p className="text-xs text-slate-600 py-4 text-center">Sin avisos registrados</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-700/40">
            {ultimosAvisos.map((a) => {
              const pr = PRIORIDAD[a.prioridad] ?? { cls: 'bg-slate-600/50 text-slate-400' }
              return (
                <div key={a.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {a.tag}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{a.descripcion}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', pr.cls)}>
                      {a.prioridad}
                    </span>
                    <span className="text-[10px] text-slate-600">{fmtDate(a.fecha)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
