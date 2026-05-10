'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PRIORIDAD_CONFIG, EJECUTANTE_CONFIG,
  type Prioridad, type Ejecutante, type Aviso,
} from '@/lib/notices/types'
import { getISOWeek, generateId, todayISO, isoWeekLabel } from '@/lib/notices/utils'

interface AvisoFormProps {
  onSave: (aviso: Aviso) => void
}

const PRIORIDADES  = Object.entries(PRIORIDAD_CONFIG)  as [Prioridad,  typeof PRIORIDAD_CONFIG[Prioridad]][]
const EJECUTANTES  = Object.entries(EJECUTANTE_CONFIG) as [Ejecutante, typeof EJECUTANTE_CONFIG[Ejecutante]][]

export default function AvisoForm({ onSave }: AvisoFormProps) {
  const [fecha, setFecha]         = useState(todayISO())
  const [prioridad, setPrioridad] = useState<Prioridad>('MN')
  const [tag, setTag]             = useState('')
  const [ejecutante, setEjecutante] = useState<Ejecutante>('equipos_fijos')
  const [descripcion, setDesc]    = useState('')
  const [error, setError]         = useState('')

  const { week, year } = getISOWeek(new Date(fecha))

  function handleSubmit() {
    if (!descripcion.trim()) { setError('La descripción es obligatoria.'); return }
    setError('')

    onSave({
      id: generateId(),
      fecha,
      isoWeek: week,
      isoYear: year,
      prioridad,
      tag: tag.trim().toUpperCase(),
      ejecutante,
      descripcion: descripcion.trim(),
      generadoSAP: false,
      createdAt: new Date().toISOString(),
    })

    setTag('')
    setDesc('')
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-4 print:hidden">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Nuevo aviso
      </p>

      {/* Date + ISO week */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="kira-label">Fecha</label>
          <input
            type="date"
            className="kira-input mt-1"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700/40 text-center min-w-[90px]">
          <p className="text-[9px] text-slate-600 uppercase tracking-wider">Semana ISO</p>
          <p className="text-sm font-mono font-bold text-slate-300">{isoWeekLabel(week, year)}</p>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="kira-label">Prioridad</label>
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          {PRIORIDADES.map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setPrioridad(key)}
              className={cn(
                'py-2 rounded-xl border text-xs font-black font-mono transition-all',
                prioridad === key
                  ? cn(cfg.bg, cfg.color, cfg.border, 'scale-105')
                  : 'bg-slate-900/30 border-slate-700/50 text-slate-500 hover:text-slate-300',
              )}
            >
              <div>{key}</div>
              <div className="text-[8px] font-normal font-sans opacity-70 mt-0.5 truncate px-1">
                {cfg.sublabel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tag */}
      <div>
        <label className="kira-label">TAG / Activo</label>
        <input
          className="kira-input mt-1 font-mono uppercase"
          placeholder="Ej: M-010-EL, EST-003"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
      </div>

      {/* Ejecutante */}
      <div>
        <label className="kira-label">Ejecutante</label>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {EJECUTANTES.map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setEjecutante(key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors text-left',
                ejecutante === key
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-300 font-medium'
                  : 'border-slate-700/50 bg-slate-900/30 text-slate-400 hover:text-slate-200',
              )}
            >
              <span>{cfg.icon}</span>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="kira-label">Descripción técnica *</label>
        <textarea
          rows={4}
          className={cn('kira-input mt-1 resize-none w-full', error && 'border-red-500')}
          placeholder="Describir hallazgo, síntomas, repuestos necesarios, ubicación exacta…"
          value={descripcion}
          onChange={(e) => { setDesc(e.target.value); setError('') }}
        />
        {error && <p className="text-[10px] text-red-400 mt-0.5">{error}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                   bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
      >
        <Send className="w-4 h-4" />
        Registrar aviso
      </button>
    </div>
  )
}
