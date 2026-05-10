'use client'

import { useState } from 'react'
import { X, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIPO_ICONS, STATUS_COLORS } from '@/lib/geo/constants'
import type { Asset, Capa, MineId } from '@/lib/geo/types'

interface Props {
  capa:      Capa
  mina?:     MineId
  lat?:      number
  lng?:      number
  ugX?:      number
  ugY?:      number
  onSaved:   (asset: Asset) => void
  onClose:   () => void
}

const TIPOS = Object.keys(TIPO_ICONS).filter((k) => k !== 'default')
const STATUSES = Object.keys(STATUS_COLORS) as Asset['status'][]

export default function AssetFormModal({ capa, mina, lat, lng, ugX, ugY, onSaved, onClose }: Props) {
  const [tag,     setTag]     = useState('')
  const [nombre,  setNombre]  = useState('')
  const [tipo,    setTipo]    = useState(TIPOS[1])  // Equipo industrial
  const [sector,  setSector]  = useState('')
  const [status,  setStatus]  = useState<Asset['status']>('Operativo')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  async function handleSave() {
    if (!tag.trim())    { setError('El TAG es obligatorio.');    return }
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag:    tag.trim().toUpperCase(),
          nombre: nombre.trim(),
          tipo,
          capa,
          sector: sector.trim(),
          mina:   mina ?? null,
          lat:    lat  ?? null,
          lng:    lng  ?? null,
          ugX:    ugX  ?? null,
          ugY:    ugY  ?? null,
          status,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const saved = await res.json()
      onSaved({
        id:     saved.id,
        tag:    saved.tag,
        nombre: saved.nombre,
        tipo:   saved.tipo,
        capa:   saved.capa,
        sector: saved.sector,
        mina:   saved.mina,
        lat:    saved.lat,
        lng:    saved.lng,
        ug_x:   saved.ug_x,
        ug_y:   saved.ug_y,
        status: saved.status,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el activo.')
    } finally {
      setSaving(false)
    }
  }

  const coordLabel = capa === 'superficie'
    ? `Lat: ${lat?.toFixed(6)}, Lng: ${lng?.toFixed(6)}`
    : `X: ${ugX?.toFixed(1)}, Y: ${ugY?.toFixed(1)}${mina ? ` · ${mina.replace('_', ' ')}` : ''}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <p className="font-semibold text-slate-100 text-sm">Nuevo activo</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Coordinates badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">
            {capa === 'superficie' ? 'Coordenadas GPS' : 'Coordenadas subterráneas'}
          </p>
          <p className="text-[11px] font-mono text-emerald-400">{coordLabel}</p>
        </div>

        {/* TAG */}
        <div>
          <label className="kira-label">TAG *</label>
          <input
            className="kira-input mt-1 font-mono uppercase"
            placeholder="Ej: M-010-EL, BOM-003"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="kira-label">Nombre *</label>
          <input
            className="kira-input mt-1"
            placeholder="Ej: Motor ventilador N°3"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="kira-label">Tipo de activo</label>
          <select
            className="kira-input mt-1"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>{TIPO_ICONS[t]} {t}</option>
            ))}
          </select>
        </div>

        {/* Sector */}
        <div>
          <label className="kira-label">Sector / Ubicación</label>
          <input
            className="kira-input mt-1"
            placeholder="Ej: Nivel MC-450, Pañol Norte"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label className="kira-label">Estado inicial</label>
          <div className="flex gap-1.5 mt-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-colors',
                  status === s
                    ? 'border-slate-500 text-white'
                    : 'border-slate-700/50 text-slate-500 hover:text-slate-300',
                )}
                style={status === s ? { backgroundColor: STATUS_COLORS[s] + '33', borderColor: STATUS_COLORS[s] + '80', color: STATUS_COLORS[s] } : {}}
              >
                {s === 'Operativo' ? 'Operativo' : s === 'En mantenimiento' ? 'Mantenim.' : 'Fuera serv.'}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[11px] text-red-400">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold
                       transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            Guardar activo
          </button>
        </div>
      </div>
    </div>
  )
}
