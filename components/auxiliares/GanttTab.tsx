'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Plus, CalendarRange } from 'lucide-react'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'

interface GanttRow {
  id:           string
  tarea:        string
  responsable:  string
  fecha_inicio: string
  fecha_fin:    string
  progreso:     number
  color:        string | null
  orden:        number
}

const COLORS = ['#38bdf8','#34d399','#fbbf24','#f87171','#a78bfa','#fb923c','#e879f9']

interface Props {
  initialRows:    GanttRow[]
  isSuperusuario: boolean
}

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

export default function GanttTab({ initialRows, isSuperusuario }: Props) {
  const [rows, setRows]         = useState(initialRows)
  const [open, setOpen]         = useState(false)
  const [importing, setImporting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm]         = useState({
    tarea: '', responsable: '', fecha_inicio: '', fecha_fin: '', progreso: '0', color: COLORS[0],
  })

  // ── Compute chart bounds ────────────────────────────────────────────────────
  const allDates = rows.flatMap((r) => [r.fecha_inicio, r.fecha_fin]).filter(Boolean).sort()
  const minDate  = allDates[0] ?? new Date().toISOString().slice(0, 10)
  const maxDate  = allDates[allDates.length - 1] ?? minDate
  const totalDays = Math.max(daysBetween(minDate, maxDate), 1)

  function barStyle(row: GanttRow) {
    const start  = daysBetween(minDate, row.fecha_inicio)
    const dur    = Math.max(1, daysBetween(row.fecha_inicio, row.fecha_fin))
    const left   = (start / totalDays) * 100
    const width  = (dur / totalDays) * 100
    return { left: `${left}%`, width: `${Math.max(width, 1)}%` }
  }

  // ── Month headers ───────────────────────────────────────────────────────────
  function getMonthHeaders() {
    const headers: { label: string; pct: number }[] = []
    if (!minDate || !maxDate) return headers
    const start = new Date(minDate)
    const end   = new Date(maxDate)
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cur <= end) {
      const monthStart = new Date(Math.max(cur.getTime(), new Date(minDate).getTime()))
      const nextMonth  = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      const monthEnd   = new Date(Math.min(nextMonth.getTime() - 86400000, new Date(maxDate).getTime()))
      const daysInSegment = daysBetween(monthStart.toISOString().slice(0,10), monthEnd.toISOString().slice(0,10)) + 1
      const pct = (daysInSegment / totalDays) * 100
      headers.push({
        label: cur.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        pct,
      })
      cur = nextMonth
    }
    return headers
  }

  // ── Import XLSX ─────────────────────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)

    const data = await file.arrayBuffer()
    const wb   = XLSX.read(data)
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

    const mapped = json.map((r, i) => ({
      tarea:        String(r['Tarea'] ?? r['tarea'] ?? r['Task'] ?? ''),
      responsable:  String(r['Responsable'] ?? r['responsable'] ?? ''),
      fecha_inicio: excelDateToISO(r['Inicio'] ?? r['inicio'] ?? r['Start'] ?? r['fecha_inicio']),
      fecha_fin:    excelDateToISO(r['Fin'] ?? r['fin'] ?? r['End'] ?? r['fecha_fin']),
      progreso:     Number(r['Progreso'] ?? r['progreso'] ?? r['%'] ?? 0),
      color:        COLORS[i % COLORS.length],
      orden:        i,
    })).filter((r) => r.tarea && r.fecha_inicio && r.fecha_fin)

    // Limpiar anteriores e insertar nuevos
    await fetch('/api/auxiliares/gantt', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })

    const res = await fetch('/api/auxiliares/gantt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapped),
    })
    if (res.ok) setRows(await res.json())
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function excelDateToISO(val: unknown): string {
    if (!val) return ''
    if (typeof val === 'number') {
      // Excel serial date
      const d = new Date((val - 25569) * 86400 * 1000)
      return d.toISOString().slice(0, 10)
    }
    const s = String(val)
    // Try to parse dd/mm/yyyy
    const parts = s.split('/')
    if (parts.length === 3) {
      return `${parts[2].padStart(4,'20')}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
    }
    return s.slice(0, 10)
  }

  async function handleAdd() {
    if (!form.tarea || !form.fecha_inicio || !form.fecha_fin) return
    const res = await fetch('/api/auxiliares/gantt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, progreso: parseInt(form.progreso), orden: rows.length }),
    })
    if (res.ok) {
      const row = await res.json()
      setRows((p) => [...p, row])
      setOpen(false)
    }
  }

  async function handleClearAll() {
    if (!confirm('¿Borrar todo el programa de inspecciones?')) return
    setClearing(true)
    await fetch('/api/auxiliares/gantt', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setRows([])
    setClearing(false)
  }

  const monthHeaders = getMonthHeaders()

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      {isSuperusuario && (
        <div className="flex flex-wrap gap-2 items-center">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 hover:border-slate-500
                       text-slate-300 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importando...' : 'Importar desde Excel'}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva tarea
          </button>
          {rows.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30
                         text-red-400 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpiar todo
            </button>
          )}
        </div>
      )}

      {/* Hint de formato */}
      {isSuperusuario && (
        <p className="text-[11px] text-slate-600">
          Columnas esperadas en Excel: <span className="text-slate-500">Tarea · Responsable · Inicio (fecha) · Fin (fecha) · Progreso (%)</span>
        </p>
      )}

      {/* Modal nueva tarea */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-semibold text-slate-100">Nueva tarea</h3>
            {[
              { key: 'tarea',        label: 'Tarea *',       type: 'text',   placeholder: 'Nombre de la tarea' },
              { key: 'responsable',  label: 'Responsable',   type: 'text',   placeholder: 'Nombre' },
              { key: 'fecha_inicio', label: 'Fecha inicio *', type: 'date',  placeholder: '' },
              { key: 'fecha_fin',    label: 'Fecha fin *',    type: 'date',  placeholder: '' },
              { key: 'progreso',     label: 'Progreso %',     type: 'number', placeholder: '0' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  min={f.key === 'progreso' ? 0 : undefined}
                  max={f.key === 'progreso' ? 100 : undefined}
                  className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm
                             text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm">Cancelar</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gantt chart */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
          <CalendarRange className="w-8 h-8 opacity-30" />
          <p className="text-sm">Sin programa cargado</p>
          {isSuperusuario && <p className="text-xs">Importá un Excel o agregá tareas manualmente</p>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-900/50">
          <div className="min-w-[900px]">

            {/* Header: labels col + months */}
            <div className="flex border-b border-slate-700/50">
              <div className="w-64 shrink-0 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-r border-slate-700/50">
                Tarea
              </div>
              <div className="flex-1 flex">
                {monthHeaders.map((m, i) => (
                  <div
                    key={i}
                    style={{ width: `${m.pct}%` }}
                    className="text-[10px] text-slate-500 font-semibold uppercase text-center py-2 border-r border-slate-700/20 last:border-r-0 shrink-0"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className={cn('flex items-center border-b border-slate-700/30 last:border-b-0',
                  idx % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent')}
                style={{ minHeight: '40px' }}
              >
                {/* Task label */}
                <div className="w-64 shrink-0 px-4 py-2 border-r border-slate-700/50">
                  <p className="text-xs font-medium text-slate-200 truncate">{row.tarea}</p>
                  {row.responsable && (
                    <p className="text-[10px] text-slate-500 truncate">{row.responsable}</p>
                  )}
                </div>

                {/* Bar area */}
                <div className="flex-1 relative h-8 flex items-center px-1">
                  <div className="absolute inset-x-0 h-full flex">
                    {monthHeaders.map((m, i) => (
                      <div key={i} style={{ width: `${m.pct}%` }}
                           className="border-r border-slate-700/15 last:border-r-0 h-full" />
                    ))}
                  </div>
                  <div
                    className="absolute h-5 rounded-full flex items-center px-2 overflow-hidden"
                    style={{
                      ...barStyle(row),
                      backgroundColor: row.color ?? COLORS[idx % COLORS.length] + 'aa',
                      borderLeft: `3px solid ${row.color ?? COLORS[idx % COLORS.length]}`,
                    }}
                  >
                    {/* Progress fill */}
                    <div
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{ width: `${row.progreso}%`, backgroundColor: row.color ?? COLORS[idx % COLORS.length] }}
                    />
                    <span className="relative text-[10px] font-semibold text-white whitespace-nowrap">
                      {row.progreso}%
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="w-28 shrink-0 px-3 text-right">
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(row.fecha_inicio + 'T00:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'short' })}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    {new Date(row.fecha_fin + 'T00:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
