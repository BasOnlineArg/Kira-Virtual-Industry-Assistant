'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateId, getISOWeek, dateToISO } from '@/lib/work-orders/utils'
import type { WorkOrder, OtStatus } from '@/lib/work-orders/types'

interface OtFormProps {
  onSave: (ot: WorkOrder) => void
  onClose: () => void
}

const STATUS_OPTIONS: { value: OtStatus; label: string }[] = [
  { value: 'en_proceso',   label: 'En proceso'   },
  { value: 'cumplida',     label: 'Cumplida'     },
  { value: 'reprogramada', label: 'Reprogramada' },
  { value: 'anulada',      label: 'Anulada'      },
]

export default function OtForm({ onSave, onClose }: OtFormProps) {
  const today = dateToISO(new Date())
  const [otNumber, setOtNumber]       = useState('')
  const [description, setDesc]        = useState('')
  const [date, setDate]               = useState(today)
  const [hhProg, setHhProg]           = useState('')
  const [hhr, setHhr]                 = useState('')
  const [status, setStatus]           = useState<OtStatus>('en_proceso')
  const [observations, setObs]        = useState('')
  const [errors, setErrors]           = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!otNumber.trim()) e.otNumber = 'Requerido'
    else if (!/^\d{8}$/.test(otNumber.trim())) e.otNumber = 'Debe tener exactamente 8 dígitos'
    if (!description.trim()) e.description = 'Requerido'
    if (!date) e.date = 'Requerido'
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const d = new Date(date)
    const { week, year } = getISOWeek(d)

    onSave({
      id: generateId(),
      otNumber: otNumber.trim(),
      description: description.trim(),
      date,
      isoWeek: week,
      isoYear: year,
      hhProg: parseFloat(hhProg) || 0,
      hhr: parseFloat(hhr) || 0,
      status,
      observations: observations.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-semibold text-slate-200">Nueva Orden de Trabajo</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* OT Number */}
            <div>
              <label className="kira-label">N° OT (8 dígitos) *</label>
              <input
                className={cn('kira-input mt-1 font-mono', errors.otNumber && 'border-red-500')}
                placeholder="80012345"
                maxLength={8}
                value={otNumber}
                onChange={(e) => { setOtNumber(e.target.value.replace(/\D/g, '')); setErrors((p) => ({ ...p, otNumber: '' })) }}
              />
              {errors.otNumber && <p className="text-[10px] text-red-400 mt-0.5">{errors.otNumber}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="kira-label">Fecha *</label>
              <input
                type="date"
                className={cn('kira-input mt-1', errors.date && 'border-red-500')}
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })) }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="kira-label">Descripción *</label>
            <input
              className={cn('kira-input mt-1', errors.description && 'border-red-500')}
              placeholder="Descripción de la tarea…"
              value={description}
              onChange={(e) => { setDesc(e.target.value); setErrors((p) => ({ ...p, description: '' })) }}
            />
            {errors.description && <p className="text-[10px] text-red-400 mt-0.5">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* HH Prog */}
            <div>
              <label className="kira-label">HH Prog</label>
              <input
                type="number" min="0" step="0.5"
                className="kira-input mt-1 font-mono"
                placeholder="8"
                value={hhProg}
                onChange={(e) => setHhProg(e.target.value)}
              />
            </div>

            {/* HHR */}
            <div>
              <label className="kira-label">HHR</label>
              <input
                type="number" min="0" step="0.5"
                className="kira-input mt-1 font-mono"
                placeholder="0"
                value={hhr}
                onChange={(e) => setHhr(e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className="kira-label">Estado</label>
              <select
                className="kira-input mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value as OtStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="kira-label">Observaciones</label>
            <textarea
              rows={2}
              className="kira-input mt-1 resize-none w-full"
              placeholder="Hallazgos, justificaciones, notas de campo…"
              value={observations}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-slate-800">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
            Guardar OT
          </button>
        </div>
      </div>
    </div>
  )
}
