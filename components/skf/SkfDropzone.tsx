'use client'

import { useRef, useState } from 'react'
import { FileText, FileSpreadsheet, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DroppedFiles {
  csv: File | null
  pdf: File | null
}

interface SkfDropzoneProps {
  files: DroppedFiles
  onChange: (files: DroppedFiles) => void
  disabled?: boolean
}

function FileChip({
  file,
  icon: Icon,
  color,
  onRemove,
  disabled,
}: {
  file: File
  icon: React.ComponentType<{ className?: string }>
  color: string
  onRemove: () => void
  disabled?: boolean
}) {
  const kb = (file.size / 1024).toFixed(0)
  const mb = (file.size / 1024 / 1024).toFixed(1)
  const size = file.size > 1024 * 1024 ? `${mb} MB` : `${kb} KB`

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border', color)}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
        <p className="text-xs text-slate-500">{size}</p>
      </div>
      {!disabled && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default function SkfDropzone({ files, onChange, disabled }: SkfDropzoneProps) {
  const csvRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)
  const [draggingOver, setDraggingOver] = useState<'csv' | 'pdf' | null>(null)

  function handleDrop(type: 'csv' | 'pdf', e: React.DragEvent) {
    e.preventDefault()
    setDraggingOver(null)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (type === 'csv' && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      onChange({ ...files, csv: file })
    }
    if (type === 'pdf' && file.name.endsWith('.pdf')) {
      onChange({ ...files, pdf: file })
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Archivos SKF QuickCollect
      </p>

      {/* CSV slot */}
      {files.csv ? (
        <FileChip
          file={files.csv}
          icon={FileSpreadsheet}
          color="border-emerald-500/20 bg-emerald-500/5"
          onRemove={() => onChange({ ...files, csv: null })}
          disabled={disabled}
        />
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
            draggingOver === 'csv'
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && csvRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDraggingOver('csv') }}
          onDragLeave={() => setDraggingOver(null)}
          onDrop={disabled ? undefined : (e) => handleDrop('csv', e)}
        >
          <input
            ref={csvRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onChange({ ...files, csv: f })
              e.target.value = ''
            }}
          />
          <FileSpreadsheet className="w-7 h-7 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">
            Arrastrá el <span className="text-emerald-400">CSV</span> de QuickCollect
          </p>
          <p className="text-xs text-slate-600 mt-0.5">o hacé click para seleccionar · .csv .txt</p>
        </div>
      )}

      {/* PDF slot */}
      {files.pdf ? (
        <FileChip
          file={files.pdf}
          icon={FileText}
          color="border-sky-500/20 bg-sky-500/5"
          onRemove={() => onChange({ ...files, pdf: null })}
          disabled={disabled}
        />
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
            draggingOver === 'pdf'
              ? 'border-sky-500 bg-sky-500/5'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && pdfRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDraggingOver('pdf') }}
          onDragLeave={() => setDraggingOver(null)}
          onDrop={disabled ? undefined : (e) => handleDrop('pdf', e)}
        >
          <input
            ref={pdfRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onChange({ ...files, pdf: f })
              e.target.value = ''
            }}
          />
          <FileText className="w-7 h-7 text-sky-500/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">
            Arrastrá el <span className="text-sky-400">PDF</span> de QuickCollect
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            opcional — enriquece el diagnóstico · .pdf
          </p>
        </div>
      )}

      {/* Upload hint */}
      {(files.csv || files.pdf) && (
        <div className="flex items-center gap-2 text-[10px] text-slate-600 px-1">
          <Upload className="w-3 h-3" />
          <span>
            {[files.csv && 'CSV', files.pdf && 'PDF'].filter(Boolean).join(' + ')} cargado{(files.csv && files.pdf) ? 's' : ''}
            {!files.pdf && ' — podés agregar el PDF para mayor contexto'}
          </span>
        </div>
      )}
    </div>
  )
}
