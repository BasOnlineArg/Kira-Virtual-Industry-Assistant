'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Aviso } from '@/lib/notices/types'

interface AvisoKpiBarProps {
  avisos: Aviso[]
}

export default function AvisoKpiBar({ avisos: all }: AvisoKpiBarProps) {
  const kpis = useMemo(() => {
    const total     = all.length
    const pendientes = all.filter((a) => !a.generadoSAP).length
    const mi        = all.filter((a) => a.prioridad === 'MI' && !a.generadoSAP).length
    const bkl       = all.filter((a) => a.prioridad === 'BKL' && !a.generadoSAP).length
    const generados = all.filter((a) => a.generadoSAP).length
    const eficiencia = total > 0 ? Math.round((generados / total) * 100) : 0
    return { total, pendientes, mi, bkl, generados, eficiencia }
  }, [all])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:hidden">

      {/* Total */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total avisos</p>
        <p className="text-2xl font-mono font-bold text-slate-200">{kpis.total}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">carga histórica</p>
      </div>

      {/* Pendientes — blinks if > 0 */}
      <div className={cn(
        'border rounded-2xl p-4',
        kpis.pendientes > 0
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-slate-800/60 border-slate-700/40',
      )}>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Pendientes SAP</p>
        <p className={cn(
          'text-2xl font-mono font-bold',
          kpis.pendientes > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400',
        )}>
          {kpis.pendientes}
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">sin volcar a SAP</p>
      </div>

      {/* MI críticos */}
      <div className={cn(
        'border rounded-2xl p-4',
        kpis.mi > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/60 border-slate-700/40',
      )}>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">MI — Críticos</p>
        <p className={cn('text-2xl font-mono font-bold', kpis.mi > 0 ? 'text-red-400' : 'text-slate-500')}>
          {kpis.mi}
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">urgentes pendientes</p>
      </div>

      {/* BKL */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">BKL — Backlog</p>
        <p className="text-2xl font-mono font-bold text-amber-400">{kpis.bkl}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">baja prioridad</p>
      </div>

      {/* Eficiencia */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Volcados SAP</p>
        <p className={cn(
          'text-2xl font-mono font-bold',
          kpis.eficiencia >= 80 ? 'text-emerald-400' : kpis.eficiencia >= 50 ? 'text-amber-400' : 'text-red-400',
        )}>
          {kpis.eficiencia}%
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">{kpis.generados} de {kpis.total}</p>
      </div>
    </div>
  )
}
