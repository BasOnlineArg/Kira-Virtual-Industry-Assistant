'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import OtStatusBadge from './OtStatusBadge'
import { STATUS_CONFIG, type WorkOrder, type OtStatus } from '@/lib/work-orders/types'
import { isoWeekLabel } from '@/lib/work-orders/utils'

interface OtTableProps {
  orders: WorkOrder[]
  onUpdate: (id: string, patch: Partial<WorkOrder>) => void
  onDelete: (id: string) => void
  recentIds: Set<string>
}

type EditCell = { id: string; field: 'hhr' | 'hhProg' | 'observations' | 'description' | 'otNumber' } | null

const STATUS_OPTIONS: OtStatus[] = ['en_proceso', 'cumplida', 'reprogramada', 'anulada']

// Suggest "mark as cumplida" when HHR > 0 but still en_proceso
function SuggestClose({ ot, onAccept }: { ot: WorkOrder; onAccept: () => void }) {
  if (ot.status !== 'en_proceso' || ot.hhr <= 0) return null
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 ml-2">
      <AlertTriangle className="w-3 h-3 text-blue-400 shrink-0" />
      <p className="text-[10px] text-blue-300">¿Marcar como Cumplida?</p>
      <button
        onClick={onAccept}
        className="text-[10px] font-bold text-blue-400 hover:text-blue-200 ml-1"
      >
        Sí
      </button>
    </div>
  )
}

export default function OtTable({ orders, onUpdate, onDelete, recentIds }: OtTableProps) {
  const [editCell, setEditCell] = useState<EditCell>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editCell) inputRef.current?.focus()
  }, [editCell])

  const startEdit = useCallback((id: string, field: NonNullable<EditCell>['field'], current: string | number) => {
    setEditCell({ id, field })
    setEditValue(String(current))
  }, [])

  const commitEdit = useCallback(() => {
    if (!editCell) return
    const { id, field } = editCell
    let value: string | number = editValue
    if (field === 'hhr' || field === 'hhProg') {
      value = Math.max(0, parseFloat(editValue.replace(',', '.')) || 0)
    }
    onUpdate(id, { [field]: value, updatedAt: new Date().toISOString() })
    setEditCell(null)
  }, [editCell, editValue, onUpdate])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') setEditCell(null)
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600">
        <p className="text-sm">No hay OTs para mostrar</p>
        <p className="text-xs mt-1">Cargá una nueva OT o importá desde XLSX</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/40">
      <table className="w-full text-xs border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-slate-800/80 border-b border-slate-700/50">
            {['N° OT', 'Descripción', 'Semana', 'Fecha', 'HH Prog', 'HHR', 'Δ HH', 'Estado', 'Observaciones', ''].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {orders.map((ot) => {
            const cfg = STATUS_CONFIG[ot.status]
            const isRecent = recentIds.has(ot.id)
            const delta = ot.hhProg > 0 ? ot.hhr - ot.hhProg : null
            const isCritical = ot.status === 'anulada'

            return (
              <tr
                key={ot.id}
                className={cn(
                  'border-l-2 transition-all duration-500 group',
                  cfg.row,
                  isRecent && 'animate-pulse-once bg-blue-500/5',
                  isCritical && 'opacity-60',
                  'hover:bg-slate-800/30',
                )}
              >
                {/* OT Number */}
                <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">
                  {editCell?.id === ot.id && editCell.field === 'otNumber' ? (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      className="w-24 bg-slate-700 rounded px-1 py-0.5 font-mono text-slate-100 outline-none border border-blue-500"
                      value={editValue}
                      maxLength={8}
                      onChange={(e) => setEditValue(e.target.value.replace(/\D/g, ''))}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => startEdit(ot.id, 'otNumber', ot.otNumber)}
                    >
                      {ot.otNumber || '—'}
                    </span>
                  )}
                </td>

                {/* Description */}
                <td className="px-3 py-2 text-slate-300 max-w-[220px]">
                  {editCell?.id === ot.id && editCell.field === 'description' ? (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      className="w-full bg-slate-700 rounded px-1 py-0.5 text-slate-100 outline-none border border-blue-500"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:text-blue-400 transition-colors line-clamp-2"
                      onClick={() => startEdit(ot.id, 'description', ot.description)}
                      title={ot.description}
                    >
                      {ot.description || '—'}
                    </span>
                  )}
                </td>

                {/* ISO Week */}
                <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap">
                  {isoWeekLabel(ot.isoWeek, ot.isoYear)}
                </td>

                {/* Date */}
                <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                  {new Date(ot.date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                </td>

                {/* HH Prog */}
                <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap">
                  {editCell?.id === ot.id && editCell.field === 'hhProg' ? (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="number" min="0" step="0.5"
                      className="w-16 bg-slate-700 rounded px-1 py-0.5 font-mono text-slate-100 outline-none border border-blue-500"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => startEdit(ot.id, 'hhProg', ot.hhProg)}
                    >
                      {ot.hhProg > 0 ? ot.hhProg.toFixed(1) : '—'}
                    </span>
                  )}
                </td>

                {/* HHR */}
                <td className="px-3 py-2 font-mono whitespace-nowrap">
                  {editCell?.id === ot.id && editCell.field === 'hhr' ? (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="number" min="0" step="0.5"
                      className="w-16 bg-slate-700 rounded px-1 py-0.5 font-mono text-slate-100 outline-none border border-blue-500"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <span
                      className={cn(
                        'cursor-pointer hover:text-blue-400 transition-colors font-bold',
                        ot.hhr > 0 ? 'text-slate-200' : 'text-slate-600',
                      )}
                      onClick={() => startEdit(ot.id, 'hhr', ot.hhr)}
                    >
                      {ot.hhr > 0 ? ot.hhr.toFixed(1) : '—'}
                    </span>
                  )}
                </td>

                {/* Delta */}
                <td className="px-3 py-2 font-mono whitespace-nowrap">
                  {delta != null ? (
                    <span className={cn(
                      'text-[10px] font-bold',
                      delta > 0 ? 'text-amber-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-500',
                    )}>
                      {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-700">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <select
                      value={ot.status}
                      onChange={(e) => onUpdate(ot.id, { status: e.target.value as OtStatus, updatedAt: new Date().toISOString() })}
                      className="bg-transparent border-0 outline-none cursor-pointer text-[11px] font-semibold"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                    <OtStatusBadge status={ot.status} size="sm" />
                  </div>
                  <SuggestClose ot={ot} onAccept={() => onUpdate(ot.id, { status: 'cumplida', updatedAt: new Date().toISOString() })} />
                </td>

                {/* Observations */}
                <td className="px-3 py-2 text-slate-500 max-w-[180px]">
                  {editCell?.id === ot.id && editCell.field === 'observations' ? (
                    <textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      rows={2}
                      className="w-full bg-slate-700 rounded px-1 py-0.5 text-slate-100 outline-none border border-blue-500 resize-none text-[11px]"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => { if (e.key === 'Escape') setEditCell(null) }}
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:text-blue-400 transition-colors line-clamp-2 text-[11px]"
                      onClick={() => startEdit(ot.id, 'observations', ot.observations)}
                      title={ot.observations}
                    >
                      {ot.observations || <span className="text-slate-700 italic">Agregar nota…</span>}
                    </span>
                  )}
                </td>

                {/* Delete */}
                <td className="px-3 py-2">
                  <button
                    onClick={() => onDelete(ot.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all text-lg leading-none"
                    title="Eliminar OT"
                  >
                    ×
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
