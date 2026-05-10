'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  TIPO_ACTIVO_CONFIG, TIPO_DOC_CONFIG,
  type TipoActivo, type TipoDoc, type FormatoDoc, type Manual,
} from '@/lib/manuals/types'

interface Props {
  onUploaded: (manual: Manual) => void
  onClose:    () => void
}

const TIPO_ACTIVOS = Object.entries(TIPO_ACTIVO_CONFIG) as [TipoActivo, typeof TIPO_ACTIVO_CONFIG[TipoActivo]][]

type Step = 'form' | 'uploading' | 'processing'

export default function ManualUploadModal({ onUploaded, onClose }: Props) {
  const [nombre,     setNombre]     = useState('')
  const [tipoActivo, setTipoActivo] = useState<TipoActivo>('motores')
  const [fabricante, setFabricante] = useState('')
  const [tipoDoc,    setTipoDoc]    = useState<TipoDoc>('manual')
  const [file,       setFile]       = useState<File | null>(null)
  const [step,       setStep]       = useState<Step>('form')
  const [error,      setError]      = useState('')
  const [progress,   setProgress]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const formato: FormatoDoc | null = file
    ? file.name.toLowerCase().endsWith('.txt')
      ? 'txt'
      : file.name.toLowerCase().endsWith('.pdf')
      ? 'pdf'
      : 'imagen'
    : null

  async function handleSubmit() {
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!fabricante.trim()) { setError('El fabricante es obligatorio.'); return }
    if (!file || !formato) { setError('Seleccioná un archivo PDF, imagen o TXT.'); return }
    setError('')
    setStep('uploading')

    try {
      // 1. Upload to Supabase Storage (client-side, avoids 4MB limit)
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const storagePath = `${tipoActivo}/${Date.now()}_${nombre.replace(/[^a-z0-9]/gi, '_')}.${ext}`

      setProgress('Subiendo archivo…')
      const { error: upErr } = await supabase.storage
        .from('manuals')
        .upload(storagePath, file, { contentType: file.type, upsert: false })

      if (upErr) throw new Error(`Storage: ${upErr.message}`)

      // 2. Register in DB via API
      setProgress('Registrando documento…')
      const regRes = await fetch('/api/manuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          tipoActivo,
          fabricante: fabricante.trim(),
          tipoDoc,
          formato,
          storagePath,
          tamanoBytes: file.size,
        }),
      })
      if (!regRes.ok) throw new Error(await regRes.text())
      const manual = await regRes.json() as Manual

      // 3. Trigger processing (async — don't await full response)
      setStep('processing')
      setProgress('Extrayendo texto e indexando…')
      fetch('/api/manuals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualId: manual.id }),
      }).then(async (r) => {
        if (r.ok) {
          const { chunks } = await r.json()
          onUploaded({ ...manual, procesado: true, chunkCount: chunks })
        }
      })

      // Return the manual immediately (procesado will update async)
      onUploaded(manual)
      onClose()

    } catch (e) {
      console.error('[Upload]', e)
      setError(e instanceof Error ? e.message : 'Error al subir el archivo.')
      setStep('form')
    }
  }

  const busy = step !== 'form'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-100">Cargar documento técnico</p>
          <button onClick={onClose} disabled={busy} className="text-slate-500 hover:text-slate-300 disabled:opacity-30">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nombre */}
        <div>
          <label className="kira-label">Nombre del documento *</label>
          <input
            className="kira-input mt-1"
            placeholder="Ej: Manual Motor ABB M3BP 355"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={busy}
          />
        </div>

        {/* Tipo doc */}
        <div>
          <label className="kira-label">Tipo de documento</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(Object.entries(TIPO_DOC_CONFIG) as [TipoDoc, typeof TIPO_DOC_CONFIG[TipoDoc]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setTipoDoc(key)}
                disabled={busy}
                className={cn(
                  'py-2 rounded-xl border text-xs font-medium transition-colors',
                  tipoDoc === key ? cn(cfg.bg, cfg.color, cfg.border) : 'border-slate-700 text-slate-500 hover:text-slate-300',
                )}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo activo */}
        <div>
          <label className="kira-label">Tipo de equipo *</label>
          <select
            className="kira-input mt-1"
            value={tipoActivo}
            onChange={(e) => setTipoActivo(e.target.value as TipoActivo)}
            disabled={busy}
          >
            {TIPO_ACTIVOS.map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>

        {/* Fabricante */}
        <div>
          <label className="kira-label">Fabricante / OEM *</label>
          <input
            className="kira-input mt-1"
            placeholder="Ej: ABB, SKF, Siemens, Grundfos"
            value={fabricante}
            onChange={(e) => setFabricante(e.target.value)}
            disabled={busy}
          />
        </div>

        {/* File */}
        <div>
          <label className="kira-label">Archivo (PDF, imagen o TXT) *</label>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={cn(
              'mt-1 w-full rounded-xl border-2 border-dashed py-5 text-center text-xs transition-colors',
              file
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300',
            )}
          >
            <Upload className="w-5 h-5 mx-auto mb-1 opacity-60" />
            {file ? file.name : 'Hacé clic para seleccionar archivo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && <p className="text-[11px] text-red-400">{error}</p>}

        {/* Progress */}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-violet-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {progress}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold
                     transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? 'Procesando…' : 'Cargar documento'}
        </button>
      </div>
    </div>
  )
}
