'use client'

import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'

interface Equipo { id: string; nombre: string; descripcion: string; responsable: string }

export default function EquiposTab({ initialItems }: { initialItems: Equipo[] }) {
  const [items, setItems]   = useState(initialItems)
  const [open, setOpen]     = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm]     = useState({ nombre: '', descripcion: '', responsable: '' })

  function setField(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })) }

  async function handleSave() {
    if (!form.nombre.trim()) return
    setSaving(true)
    const res = await fetch('/api/auxiliares?tabla=equipos_trabajo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const item = await res.json()
      setItems((p) => [...p, item])
      setForm({ nombre: '', descripcion: '', responsable: '' })
      setOpen(false)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const res = await fetch('/api/auxiliares?tabla=equipos_trabajo', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setItems((p) => p.filter((i) => i.id !== id))
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo equipo
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-semibold text-slate-100">Nuevo equipo de trabajo</h3>
            {[
              { key: 'nombre',      label: 'Nombre *',      placeholder: 'Nombre del equipo' },
              { key: 'responsable', label: 'Responsable',   placeholder: 'Nombre del responsable' },
              { key: 'descripcion', label: 'Descripción',   placeholder: 'Descripción opcional' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm
                             text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            ))}
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm">Cancelar</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nombre.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.length === 0 && (
          <p className="col-span-full text-sm text-slate-500 text-center py-10">Sin equipos cargados.</p>
        )}
        {items.map((eq) => (
          <div key={eq.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-200">{eq.nombre}</span>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                disabled={deleting === eq.id}
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {eq.responsable && <p className="text-xs text-slate-400">Responsable: {eq.responsable}</p>}
            {eq.descripcion  && <p className="text-xs text-slate-500">{eq.descripcion}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
