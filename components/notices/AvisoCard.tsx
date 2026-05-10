'use client'

import { Trash2, CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORIDAD_CONFIG, EJECUTANTE_CONFIG, type Aviso } from '@/lib/notices/types'
import { isoWeekLabel } from '@/lib/notices/utils'

interface AvisoCardProps {
  aviso: Aviso
  onToggleSAP: (id: string) => void
  onDelete: (id: string) => void
}

export default function AvisoCard({ aviso, onToggleSAP, onDelete }: AvisoCardProps) {
  const pCfg = PRIORIDAD_CONFIG[aviso.prioridad]
  const eCfg = EJECUTANTE_CONFIG[aviso.ejecutante]
  const isDone = aviso.generadoSAP

  return (
    <div className={cn(
      'relative rounded-2xl border p-4 transition-all duration-300 print:shadow-none',
      isDone
        ? 'border-slate-700/30 bg-slate-800/20 opacity-50'
        : cn(pCfg.border, pCfg.bg),
      // MI urgent left accent
      aviso.prioridad === 'MI' && !isDone && 'border-l-4 border-l-red-500',
    )}>

      {/* MI pulse ring */}
      {aviso.prioridad === 'MI' && !isDone && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority badge */}
          <span className={cn(
            'px-2.5 py-1 rounded-lg text-sm font-black font-mono border',
            pCfg.color, pCfg.bg, pCfg.border,
          )}>
            {pCfg.label}
          </span>

          {/* Tag */}
          {aviso.tag && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">
              {aviso.tag}
            </span>
          )}

          {/* Specialty */}
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{eCfg.icon}</span>
            {eCfg.label}
          </span>
        </div>

        {/* Date + week */}
        <div className="text-right shrink-0">
          <p className="text-[10px] font-mono text-slate-500">
            {new Date(aviso.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
          <p className="text-[10px] font-mono text-slate-600">
            {isoWeekLabel(aviso.isoWeek, aviso.isoYear)}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className={cn(
        'text-sm leading-relaxed',
        isDone ? 'line-through text-slate-600' : 'text-slate-300',
      )}>
        {aviso.descripcion}
      </p>

      {/* Priority sublabel */}
      <p className={cn('text-[10px] mt-1', pCfg.color, isDone && 'opacity-50')}>
        {pCfg.sublabel}
      </p>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30 print:hidden">
        {/* SAP checkbox */}
        <button
          onClick={() => onToggleSAP(aviso.id)}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium transition-colors',
            isDone ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300',
          )}
        >
          {isDone
            ? <CheckSquare className="w-4 h-4" />
            : <Square className="w-4 h-4" />
          }
          {isDone ? 'Generado en SAP' : 'Marcar como generado en SAP'}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(aviso.id)}
          className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Eliminar aviso"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
