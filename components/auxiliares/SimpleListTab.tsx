'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Item { id: string; nombre: string; [k: string]: unknown }

interface Props {
  tabla:        string
  initialItems: Item[]
  readOnly?:    boolean
  extraFields?: { key: string; label: string; placeholder?: string }[]
}

export default function SimpleListTab({ tabla, initialItems, readOnly = false, extraFields = [] }: Props) {
  const [items, setItems]   = useState(initialItems)
  const [nombre, setNombre] = useState('')
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    if (!nombre.trim()) return
    setError('')
    setSaving(true)
    const body: Record<string, string> = { nombre: nombre.trim() }
    extraFields.forEach((f) => { body[f.key] = extras[f.key] ?? '' })

    const res = await fetch(`/api/auxiliares?tabla=${tabla}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const item = await res.json()
      setItems((prev) => [...prev, item])
      setNombre('')
      setExtras({})
    } else {
      const { error: msg } = await res.json()
      setError(msg?.includes('unique') ? 'Ya existe un ítem con ese nombre.' : msg)
    }
    setSaving(false)
  }

  async function handleEdit(id: string) {
    if (!editVal.trim()) return
    const res = await fetch(`/api/auxiliares?tabla=${tabla}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre: editVal.trim() }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems((prev) => prev.map((i) => i.id === id ? updated : i))
    }
    setEditId(null)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const res = await fetch(`/api/auxiliares?tabla=${tabla}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id))
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Add form */}
      {!readOnly && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Agregar ítem</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nombre..."
              className="flex-1 min-w-[200px] rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm
                         text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {extraFields.map((f) => (
              <input
                key={f.key}
                value={extras[f.key] ?? ''}
                onChange={(e) => setExtras((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder ?? f.label}
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm
                           text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            ))}
            <button
              onClick={handleAdd}
              disabled={saving || !nombre.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500
                         disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-1.5">
        {items.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-10">Sin ítems cargados.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-800/30 px-4 py-2.5"
          >
            {editId === item.id ? (
              <>
                <input
                  autoFocus
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(item.id); if (e.key === 'Escape') setEditId(null) }}
                  className="flex-1 rounded-lg bg-slate-900 border border-sky-500/50 px-2 py-1 text-sm text-slate-200
                             focus:outline-none"
                />
                <button onClick={() => handleEdit(item.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditId(null)} className="text-slate-500 hover:text-slate-300 p-1">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-slate-300">{item.nombre}</span>
                {extraFields.map((f) => (
                  <span key={f.key} className="text-xs text-slate-500">{String(item[f.key] ?? '')}</span>
                ))}
                {!readOnly && (
                  <>
                    <button
                      onClick={() => { setEditId(item.id); setEditVal(item.nombre) }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
