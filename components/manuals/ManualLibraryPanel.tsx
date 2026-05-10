'use client'

import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ManualCard from './ManualCard'
import ManualUploadModal from './ManualUploadModal'
import { TIPO_ACTIVO_CONFIG, TIPO_DOC_CONFIG, type Manual, type TipoDoc, type TipoActivo } from '@/lib/manuals/types'

interface Props {
  manuals:       Manual[]
  selectedId:    string | null
  onSelect:      (m: Manual) => void
  onDelete:      (id: string) => void
  onNewManual:   (m: Manual) => void
}

export default function ManualLibraryPanel({ manuals, selectedId, onSelect, onDelete, onNewManual }: Props) {
  const [search,      setSearch]      = useState('')
  const [filterDoc,   setFilterDoc]   = useState<TipoDoc | 'all'>('all')
  const [filterAct,   setFilterAct]   = useState<TipoActivo | 'all'>('all')
  const [showUpload,  setShowUpload]  = useState(false)

  const filtered = manuals.filter((m) => {
    if (filterDoc !== 'all' && m.tipoDoc !== filterDoc) return false
    if (filterAct !== 'all' && m.tipoActivo !== filterAct) return false
    if (search) {
      const q = search.toLowerCase()
      if (![m.nombre, m.fabricante, TIPO_ACTIVO_CONFIG[m.tipoActivo].label].some((f) => f.toLowerCase().includes(q))) return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Biblioteca · {manuals.length} doc{manuals.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500
                     text-white text-[11px] font-semibold transition-colors"
        >
          <Plus className="w-3 h-3" />
          Cargar
        </button>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        <input
          className="w-full pl-7 pr-7 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50
                     text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
          placeholder="Buscar por nombre, fabricante…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-slate-500" />
          </button>
        )}
      </div>

      {/* Doc type filter */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => setFilterDoc('all')}
          className={cn(
            'flex-1 py-1 rounded-lg border text-[10px] font-medium transition-colors',
            filterDoc === 'all' ? 'bg-slate-700 text-slate-200 border-slate-600' : 'border-slate-700/50 text-slate-500 hover:text-slate-300',
          )}
        >Todos</button>
        {(Object.entries(TIPO_DOC_CONFIG) as [TipoDoc, typeof TIPO_DOC_CONFIG[TipoDoc]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterDoc(filterDoc === key ? 'all' : key)}
            className={cn(
              'flex-1 py-1 rounded-lg border text-[10px] font-medium transition-colors',
              filterDoc === key ? cn(cfg.bg, cfg.color, cfg.border) : 'border-slate-700/50 text-slate-500 hover:text-slate-300',
            )}
          >
            {key === 'manual' ? 'Manuales' : 'Pautas'}
          </button>
        ))}
      </div>

      {/* Activo filter */}
      <select
        className="kira-input text-[10px] py-1 shrink-0"
        value={filterAct}
        onChange={(e) => setFilterAct(e.target.value as TipoActivo | 'all')}
      >
        <option value="all">Todos los equipos</option>
        {(Object.entries(TIPO_ACTIVO_CONFIG) as [TipoActivo, typeof TIPO_ACTIVO_CONFIG[TipoActivo]][]).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
        ))}
      </select>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-600">
            <p className="text-sm">{manuals.length === 0 ? 'Sin documentos' : 'Sin resultados'}</p>
            <p className="text-xs mt-1">{manuals.length === 0 ? 'Cargá tu primer manual' : 'Ajustá los filtros'}</p>
          </div>
        ) : filtered.map((m) => (
          <ManualCard
            key={m.id}
            manual={m}
            selected={m.id === selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>

      {showUpload && (
        <ManualUploadModal
          onUploaded={(m) => { onNewManual(m); setShowUpload(false) }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}
