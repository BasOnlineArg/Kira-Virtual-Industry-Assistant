'use client'

import { AlertTriangle, WifiOff, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActiveAsset {
  id:     string
  tag:    string
  nombre: string
  status: string
}

interface AvisoMI {
  id:          string
  tag:         string
  descripcion: string
  fecha:       string
}

interface Props {
  alertasActivos:  ActiveAsset[]
  avisosMIActivos: AvisoMI[]
}

export default function AlertsPanel({ alertasActivos, avisosMIActivos }: Props) {
  const hasAlerts = alertasActivos.length > 0 || avisosMIActivos.length > 0

  if (!hasAlerts) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-600">
        <Bell className="w-6 h-6 opacity-40" />
        <p className="text-sm">Sin alertas activas</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Assets out of service */}
      {alertasActivos.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5"
        >
          <span className="mt-0.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-red-400 truncate">
              <WifiOff className="inline w-3 h-3 mr-1 -mt-0.5" />
              {a.tag}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{a.nombre}</p>
          </div>
          <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
            Fuera de servicio
          </span>
        </div>
      ))}

      {/* MI notices without SAP */}
      {avisosMIActivos.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5"
        >
          <AlertTriangle className="mt-0.5 shrink-0 w-3.5 h-3.5 text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-amber-400 truncate">
              MI — {a.tag}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{a.descripcion}</p>
          </div>
          <span className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
            'bg-amber-500/15 text-amber-400',
          )}>
            {a.fecha ? new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
              day: '2-digit', month: 'short',
            }) : '—'}
          </span>
        </div>
      ))}

    </div>
  )
}
