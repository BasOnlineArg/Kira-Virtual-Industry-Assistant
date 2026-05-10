'use client'

import { Trash2, FileText, Image, AlignLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIPO_ACTIVO_CONFIG, TIPO_DOC_CONFIG, type Manual } from '@/lib/manuals/types'

interface Props {
  manual:    Manual
  selected:  boolean
  onSelect:  (m: Manual) => void
  onDelete:  (id: string) => void
}

const FORMAT_ICON = {
  pdf:    FileText,
  imagen: Image,
  txt:    AlignLeft,
}

export default function ManualCard({ manual, selected, onSelect, onDelete }: Props) {
  const docCfg  = TIPO_DOC_CONFIG[manual.tipoDoc]
  const actCfg  = TIPO_ACTIVO_CONFIG[manual.tipoActivo]
  const FmtIcon = FORMAT_ICON[manual.formato] ?? FileText
  const sizeKB  = (manual.tamanoBytes / 1024).toFixed(0)

  return (
    <div
      onClick={() => onSelect(manual)}
      className={cn(
        'group relative rounded-xl border p-3 cursor-pointer transition-all',
        selected
          ? 'border-violet-500/50 bg-violet-500/10'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60',
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-2">
        <div className={cn('shrink-0 p-1.5 rounded-lg border mt-0.5', docCfg.bg, docCfg.border)}>
          <FmtIcon className={cn('w-3.5 h-3.5', docCfg.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-200 truncate">{manual.nombre}</p>
          <p className="text-[10px] text-slate-500 truncate">{manual.fabricante}</p>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(manual.id) }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', docCfg.bg, docCfg.color, docCfg.border)}>
          {docCfg.label}
        </span>
        <span className="text-[10px] text-slate-500">{actCfg.icon} {actCfg.label}</span>
        <span className="ml-auto text-[9px] text-slate-600">{sizeKB} KB</span>
      </div>

      {/* Processing state */}
      {!manual.procesado ? (
        <div className="flex items-center gap-1 mt-1.5 text-[9px] text-amber-400">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Procesando…
        </div>
      ) : (
        <div className="mt-1.5 text-[9px] text-slate-600">
          {manual.chunkCount} fragmento{manual.chunkCount !== 1 ? 's' : ''} indexados
        </div>
      )}
    </div>
  )
}
