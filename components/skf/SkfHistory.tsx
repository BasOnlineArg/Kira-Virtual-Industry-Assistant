'use client'

import { useState, useMemo } from 'react'
import { Search, Activity, ChevronRight, Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

export interface SkfMeasurementRow {
  id: string
  asset_tag: string | null
  tipo_equipo: string | null
  punto_medicion: string | null
  velocity_rms: number | null
  envelope_ge: number | null
  temperatura: number | null
  iso_class: string | null
  estado: string | null
  falla_prob: number | null
  rul: string | null
  diagnostico: string | null
  fecha: string
  inspector_id: string
}

interface SkfHistoryProps {
  rows: SkfMeasurementRow[]
  onSelect: (row: SkfMeasurementRow) => void
}

function EstadoBadge({ estado }: { estado: string | null }) {
  if (!estado) return null
  const cfg = {
    verde:    'bg-emerald-500/10 text-emerald-400',
    amarillo: 'bg-amber-500/10 text-amber-400',
    rojo:     'bg-red-500/10 text-red-400',
  }[estado] ?? 'bg-slate-700 text-slate-400'
  const label = { verde: 'OPERATIVO', amarillo: 'ALERTA', rojo: 'CRÍTICO' }[estado] ?? estado.toUpperCase()
  return (
    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase', cfg)}>
      {label}
    </span>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `Hace ${d} d`
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function SkfHistory({ rows, onSelect }: SkfHistoryProps) {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchText = !search.trim() ||
        (r.asset_tag ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.tipo_equipo ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.punto_medicion ?? '').toLowerCase().includes(search.toLowerCase())
      const itemDate = new Date(r.fecha)
      const matchFrom = !dateFrom || itemDate >= new Date(dateFrom)
      const matchTo = !dateTo || itemDate <= new Date(dateTo + 'T23:59:59')
      return matchText && matchFrom && matchTo
    })
  }, [rows, search, dateFrom, dateTo])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  function resetFilters() {
    setSearch(''); setDateFrom(''); setDateTo(''); setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historial</p>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por TAG, equipo o punto…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/60 border border-slate-700/50 rounded-lg
                     text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {/* Date filter */}
      <button
        onClick={() => setShowDateFilter((v) => !v)}
        className={cn(
          'flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors w-full',
          showDateFilter
            ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
            : 'border-slate-700/50 bg-slate-900/30 text-slate-500 hover:text-slate-300'
        )}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Filtrar por fecha</span>
        <ChevronDown className={cn('w-3.5 h-3.5 ml-auto transition-transform', showDateFilter && 'rotate-180')} />
      </button>

      {showDateFilter && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Desde', value: dateFrom, set: setDateFrom },
            { label: 'Hasta', value: dateTo,   set: setDateTo },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</label>
              <input
                type="date"
                value={value}
                onChange={(e) => { set(e.target.value); setVisibleCount(PAGE_SIZE) }}
                className="w-full mt-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg
                           text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Count + reset */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-600">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== rows.length && ` de ${rows.length}`}
        </p>
        {(search || dateFrom || dateTo) && (
          <button onClick={resetFilters} className="text-[10px] text-sky-500 hover:text-sky-400">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-600">
          <Activity className="w-8 h-8" />
          <p className="text-sm">Sin resultados para los filtros aplicados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((row) => (
            <button
              key={row.id}
              onClick={() => onSelect(row)}
              className="w-full text-left bg-slate-800/50 border border-slate-700/40 rounded-xl p-3
                         hover:border-sky-500/30 hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-200">
                      {row.asset_tag ?? 'Sin TAG'}
                    </span>
                    <EstadoBadge estado={row.estado} />
                    {row.iso_class && (
                      <span className="text-[10px] text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded">
                        ISO Clase {row.iso_class}
                      </span>
                    )}
                  </div>
                  {row.punto_medicion && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{row.punto_medicion}</p>
                  )}
                  <p className="text-[10px] text-slate-600 mt-0.5">{relativeTime(row.fecha)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right space-y-0.5">
                    {row.velocity_rms !== null && (
                      <p className="text-xs font-mono text-slate-300">
                        {row.velocity_rms.toFixed(2)} <span className="text-slate-600">mm/s</span>
                      </p>
                    )}
                    {row.falla_prob !== null && (
                      <p className={cn('text-xs font-mono font-semibold', {
                        'text-emerald-400': row.falla_prob < 30,
                        'text-amber-400':   row.falla_prob < 60,
                        'text-red-400':     row.falla_prob >= 60,
                      })}>
                        {row.falla_prob}%
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
              {row.rul && (
                <p className="text-[10px] text-slate-600 mt-1.5 truncate">
                  RUL: <span className="text-slate-400">{row.rul}</span>
                </p>
              )}
            </button>
          ))}

          {hasMore && (
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700/40
                         hover:border-slate-600 rounded-xl transition-colors"
            >
              Ver más ({filtered.length - visibleCount} restantes)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
