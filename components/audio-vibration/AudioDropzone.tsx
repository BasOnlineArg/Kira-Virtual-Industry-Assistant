'use client'

import { useRef, useState } from 'react'
import { Music, X, FileAudio } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioDropzoneProps {
  file: File | null
  onFileChange: (file: File) => void
  onClear: () => void
  disabled?: boolean
}

const ACCEPTED_TYPES = [
  'audio/wav', 'audio/wave', 'audio/x-wav',
  'audio/mpeg', 'audio/mp3',
  'video/mp4', 'audio/mp4',
  'video/x-msvideo',
]
const ACCEPTED_EXT = '.wav,.mp3,.mp4,.avi'
const MAX_MB = 100

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export default function AudioDropzone({ file, onFileChange, onClear, disabled }: AudioDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate(f: File): string | null {
    if (f.size > MAX_MB * 1024 * 1024) return `El archivo supera el límite de ${MAX_MB} MB.`
    return null
  }

  function process(f: File) {
    const err = validate(f)
    if (err) { setError(err); return }
    setError(null)
    onFileChange(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) process(f)
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl">
        <div className="w-10 h-10 bg-sky-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileAudio className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
        </div>
        {!disabled && (
          <button
            onClick={onClear}
            className="flex-shrink-0 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          dragging ? 'border-sky-500 bg-sky-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f) }}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <Music className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">
              Arrastrá el archivo o <span className="text-sky-400">hacé click aquí</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">WAV · MP3 · MP4 · AVI · Máx. {MAX_MB} MB</p>
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
