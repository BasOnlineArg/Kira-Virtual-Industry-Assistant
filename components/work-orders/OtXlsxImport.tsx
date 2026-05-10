'use client'

import { useState, useRef } from 'react'
import { FileSpreadsheet, X, CheckCircle, AlertTriangle, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectColumns, rowsToWorkOrders } from '@/lib/work-orders/utils'
import type { WorkOrder } from '@/lib/work-orders/types'

interface OtXlsxImportProps {
  onImport: (orders: WorkOrder[]) => void
  onClose: () => void
}

type ColKey = 'otNumber' | 'description' | 'date' | 'hhProg' | 'observations'

const COL_LABELS: Record<ColKey, string> = {
  otNumber:    'N° OT',
  description: 'Descripción',
  date:        'Fecha',
  hhProg:      'HH Prog',
  observations:'Observaciones',
}

export default function OtXlsxImport({ onImport, onClose }: OtXlsxImportProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [parsing, setParsing]   = useState(false)
  const [error, setError]       = useState('')
  const [headers, setHeaders]   = useState<string[]>([])
  const [rows, setRows]         = useState<unknown[][]>([])
  const [colMap, setColMap]     = useState<Partial<Record<ColKey, number>>>({})
  const [preview, setPreview]   = useState<WorkOrder[]>([])
  const [fileName, setFileName] = useState('')

  async function handleFile(file: File) {
    if (!file) return
    setError('')
    setParsing(true)
    setFileName(file.name)

    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

      if (data.length < 2) { setError('La hoja está vacía o no tiene datos.'); setParsing(false); return }

      const hdrs = (data[0] as unknown[]).map((h) => String(h ?? ''))
      const dataRows = data.slice(1) as unknown[][]
      const detected = detectColumns(hdrs)

      setHeaders(hdrs)
      setRows(dataRows)
      setColMap(detected)
      setPreview(rowsToWorkOrders(dataRows.slice(0, 5), hdrs, detected))
    } catch {
      setError('No se pudo leer el archivo. Verificá que sea un XLSX válido.')
    } finally {
      setParsing(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function updateColMap(key: ColKey, idx: number) {
    const next = { ...colMap, [key]: idx === -1 ? undefined : idx }
    setColMap(next)
    setPreview(rowsToWorkOrders(rows.slice(0, 5), headers, next))
  }

  function handleImport() {
    const orders = rowsToWorkOrders(rows, headers, colMap)
    onImport(orders)
  }

  const hasData = headers.length > 0

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-200">Importar desde XLSX</p>
            {fileName && <span className="text-[10px] text-slate-500 font-mono">{fileName}</span>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Dropzone */}
          {!hasData && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50
                         rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer
                         transition-colors bg-slate-800/30 hover:bg-slate-800/50"
            >
              <Upload className="w-8 h-8 text-slate-500" />
              <div className="text-center">
                <p className="text-sm text-slate-300 font-medium">Arrastrá tu archivo XLSX aquí</p>
                <p className="text-xs text-slate-500 mt-1">O hacé click para seleccionarlo · Exportaciones SAP, cronogramas Excel</p>
              </div>
              <input
                ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
              />
            </div>
          )}

          {parsing && (
            <p className="text-xs text-slate-400 animate-pulse text-center">Procesando archivo…</p>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Column mapping */}
          {hasData && (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Mapeo de columnas
                  <span className="ml-2 text-[10px] text-slate-600 normal-case font-normal">
                    Detectadas automáticamente — ajustá si es necesario
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(COL_LABELS) as ColKey[]).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-28 shrink-0">
                        {colMap[key] != null
                          ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                          : <AlertTriangle className="w-3 h-3 text-slate-600" />}
                        <label className="text-[11px] text-slate-400">{COL_LABELS[key]}</label>
                      </div>
                      <select
                        className="flex-1 kira-input text-[11px] py-1"
                        value={colMap[key] ?? -1}
                        onChange={(e) => updateColMap(key, parseInt(e.target.value))}
                      >
                        <option value={-1}>— Sin mapear —</option>
                        {headers.map((h, i) => (
                          <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                    Vista previa (primeras {preview.length} filas de {rows.length})
                  </p>
                  <div className="rounded-xl border border-slate-700/50 overflow-hidden text-[11px]">
                    <table className="w-full">
                      <thead className="bg-slate-800/60">
                        <tr>
                          {['N° OT', 'Descripción', 'Fecha', 'HH Prog'].map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {preview.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-800/30">
                            <td className="px-3 py-1.5 font-mono text-slate-300">{o.otNumber || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-400 truncate max-w-[200px]">{o.description || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-500">{o.date}</td>
                            <td className="px-3 py-1.5 font-mono text-slate-400">{o.hhProg || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {hasData && (
          <div className="flex gap-2 px-5 py-4 border-t border-slate-800 shrink-0">
            <button
              onClick={() => { setHeaders([]); setRows([]); setPreview([]); setFileName('') }}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cambiar archivo
            </button>
            <button
              onClick={handleImport}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
            >
              Importar {rows.length} OT{rows.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
