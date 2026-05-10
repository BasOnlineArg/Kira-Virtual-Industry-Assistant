'use client'

import { useRef, useState } from 'react'
import { X, ImagePlus, Trash2 } from 'lucide-react'
import type { IshikawaData, CategoryId, W5H2, BranchPhotos } from './types'
import { CATEGORIES } from './types'

const W = 900
const H = 460
const SPINE_Y = 230
const SPINE_X1 = 45
const SPINE_X2 = 742

const PROB_X = 745
const PROB_W = 148
const PROB_H = 68

interface BoneDef { attachX: number; tipX: number; tipY: number; isTop: boolean }

const BONES: Record<CategoryId, BoneDef> = {
  mano_obra:      { attachX: 205, tipX: 128, tipY: 85,  isTop: true  },
  maquina:        { attachX: 390, tipX: 313, tipY: 85,  isTop: true  },
  metodo:         { attachX: 572, tipX: 495, tipY: 85,  isTop: true  },
  material:       { attachX: 205, tipX: 128, tipY: 375, isTop: false },
  medio_ambiente: { attachX: 390, tipX: 313, tipY: 375, isTop: false },
  medicion:       { attachX: 572, tipX: 495, tipY: 375, isTop: false },
}

const W5H2_LABELS: { key: keyof W5H2; label: string }[] = [
  { key: 'what',     label: '¿Qué ocurrió?'    },
  { key: 'who',      label: '¿Quién?'           },
  { key: 'where',    label: '¿Dónde?'           },
  { key: 'when',     label: '¿Cuándo?'          },
  { key: 'why',      label: '¿Por qué?'         },
  { key: 'how',      label: '¿Cómo?'            },
  { key: 'how_much', label: '¿Cuánto impacto?'  },
]

interface Props {
  event:                string
  ishikawa:             IshikawaData
  w5h2:                 W5H2
  branchPhotos:         BranchPhotos
  onBranchPhotosChange: (id: CategoryId, photos: string[]) => void
}

export default function IshikawaChart({
  event, ishikawa, w5h2, branchPhotos, onBranchPhotosChange,
}: Props) {
  const [selectedCat, setSelectedCat] = useState<CategoryId | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const shortEvent = event
    ? event.length > 24 ? event.slice(0, 22) + '…' : event
    : '¿Qué ocurrió?'

  const cat = selectedCat ? CATEGORIES.find((c) => c.id === selectedCat)! : null
  const causes      = selectedCat ? (ishikawa[selectedCat] ?? []) : []
  const photos      = selectedCat ? (branchPhotos[selectedCat] ?? []) : []

  function handleBoneClick(id: CategoryId) {
    setSelectedCat((prev) => (prev === id ? null : id))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedCat || !e.target.files) return
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const url = ev.target?.result as string
        onBranchPhotosChange(selectedCat, [...(branchPhotos[selectedCat] ?? []), url])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removePhoto(index: number) {
    if (!selectedCat) return
    const updated = branchPhotos[selectedCat].filter((_, i) => i !== index)
    onBranchPhotosChange(selectedCat, updated)
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ── SVG ── */}
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          <defs>
            <marker id="rca-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Subtle grid */}
          {[85, 375].map((y) => (
            <line key={y} x1={SPINE_X1} y1={y} x2={PROB_X} y2={y}
              stroke="#1e293b" strokeWidth={1} strokeDasharray="4 6" />
          ))}

          {/* ── Spine ── */}
          <line
            x1={SPINE_X1} y1={SPINE_Y}
            x2={SPINE_X2 - 2} y2={SPINE_Y}
            stroke="#475569" strokeWidth={2.5}
            markerEnd="url(#rca-arrow)"
          />

          {/* ── Problem box ── */}
          <rect
            x={PROB_X} y={SPINE_Y - PROB_H / 2}
            width={PROB_W} height={PROB_H}
            rx={7} fill="#1e293b" stroke="#ef4444" strokeWidth={1.5}
          />
          <text x={PROB_X + PROB_W / 2} y={SPINE_Y - 12}
            textAnchor="middle" fontSize={8} fill="#ef4444" fontWeight="700"
            letterSpacing="1">
            EVENTO
          </text>
          <text x={PROB_X + PROB_W / 2} y={SPINE_Y + 4}
            textAnchor="middle" fontSize={8.5} fill="#fca5a5">
            {shortEvent.length > 18 ? shortEvent.slice(0, 18) : shortEvent}
          </text>
          {shortEvent.length > 18 && (
            <text x={PROB_X + PROB_W / 2} y={SPINE_Y + 17}
              textAnchor="middle" fontSize={8.5} fill="#fca5a5">
              {shortEvent.slice(18, 35)}{shortEvent.length > 35 ? '…' : ''}
            </text>
          )}

          {/* ── Bones ── */}
          {CATEGORIES.map((c) => {
            const { attachX, tipX, tipY, isTop } = BONES[c.id]
            const boneCauses  = (ishikawa[c.id] ?? []).slice(0, 7)
            const extra       = (ishikawa[c.id] ?? []).length - 7
            const isSelected  = selectedCat === c.id
            const photoCount  = (branchPhotos[c.id] ?? []).length

            return (
              <g
                key={c.id}
                onClick={() => handleBoneClick(c.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible hit area for easier clicking */}
                <line
                  x1={attachX} y1={SPINE_Y}
                  x2={tipX} y2={tipY}
                  stroke="transparent" strokeWidth={18}
                />

                {/* Highlight ring when selected */}
                {isSelected && (
                  <circle cx={attachX} cy={SPINE_Y} r={10} fill="none"
                    stroke={c.color} strokeWidth={1.5} opacity={0.6} />
                )}

                {/* Main bone */}
                <line
                  x1={attachX} y1={SPINE_Y}
                  x2={tipX} y2={tipY}
                  stroke={isSelected ? c.color + 'aa' : c.color + '60'}
                  strokeWidth={isSelected ? 2.5 : 2}
                />

                {/* Dot on spine */}
                <circle cx={attachX} cy={SPINE_Y} r={4.5}
                  fill={isSelected ? c.color : c.color + '80'} />

                {/* Category label */}
                <text
                  x={tipX} y={isTop ? tipY - 9 : tipY + 15}
                  textAnchor="middle" fontSize={10} fontWeight="700"
                  fill={isSelected ? c.color : c.color + 'cc'}
                >
                  {c.label}
                </text>

                {/* Photo badge */}
                {photoCount > 0 && (
                  <g>
                    <circle cx={tipX + 22} cy={isTop ? tipY - 14 : tipY + 20}
                      r={7} fill={c.color} />
                    <text
                      x={tipX + 22} y={isTop ? tipY - 11 : tipY + 23}
                      textAnchor="middle" fontSize={7} fill="#000" fontWeight="700"
                    >
                      {photoCount}
                    </text>
                  </g>
                )}

                {/* Cause ticks */}
                {boneCauses.map((cause, i) => {
                  const N = boneCauses.length
                  const t = (i + 1) / (N + 1)
                  const cx = tipX + t * (attachX - tipX)
                  const cy = tipY + t * (SPINE_Y - tipY)
                  const dy = isTop ? -20 : 20
                  const textY = isTop ? cy + dy - 2 : cy + dy + 9

                  return (
                    <g key={cause.id}>
                      <line x1={cx} y1={cy} x2={cx} y2={cy + dy}
                        stroke="#334155" strokeWidth={1.2} />
                      <text x={cx} y={textY}
                        textAnchor="middle" fontSize={8} fill="#64748b">
                        {cause.texto.length > 15 ? cause.texto.slice(0, 13) + '…' : cause.texto}
                      </text>
                    </g>
                  )
                })}

                {/* +N indicator */}
                {extra > 0 && (
                  <text
                    x={attachX} y={isTop ? SPINE_Y - 10 : SPINE_Y + 16}
                    textAnchor="middle" fontSize={8} fill="#475569">
                    +{extra} más
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── Branch detail panel ── */}
      {selectedCat && cat && (
        <div
          className="absolute inset-0 flex items-end pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <div
            className="w-full pointer-events-auto"
            style={{
              background: 'linear-gradient(to top, #0f172a 80%, transparent)',
              borderTop: `1px solid ${cat.color}30`,
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 16,
              paddingRight: 16,
              maxHeight: '55%',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-bold" style={{ color: cat.color }}>
                  {cat.label}
                </span>
                <span className="text-xs text-slate-500">
                  {causes.length} {causes.length === 1 ? 'causa' : 'causas'}
                  {photos.length > 0 && ` · ${photos.length} foto${photos.length > 1 ? 's' : ''}`}
                </span>
              </div>
              <button
                onClick={() => setSelectedCat(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4">
              {/* Left: 5W2H + Causes */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* 5W2H summary */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {W5H2_LABELS.filter(({ key }) => key !== 'photos').map(({ key, label }) => {
                    const val = w5h2[key] as string
                    if (!val) return null
                    return (
                      <div key={key} className="min-w-0">
                        <span className="text-[10px] text-slate-500">{label} </span>
                        <span className="text-[11px] text-slate-300 truncate block">{val}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Causes list */}
                {causes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                      Causas identificadas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {causes.map((cause) => (
                        <span
                          key={cause.id}
                          className="px-2 py-0.5 rounded-full text-[11px] border"
                          style={{
                            borderColor: cat.color + '40',
                            color: cat.color + 'cc',
                            background: cat.color + '10',
                          }}
                        >
                          {cause.texto}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {causes.length === 0 && (
                  <p className="text-xs text-slate-600 italic">
                    Sin causas cargadas para esta categoría.
                  </p>
                )}
              </div>

              {/* Right: Photos */}
              <div className="flex-shrink-0 w-48">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">
                  Fotos del branch
                </p>

                {/* Thumbnails stacked */}
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {photos.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt={`foto-${i + 1}`}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                          style={{ boxShadow: `0 2px 8px ${cat.color}20` }}
                        />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full
                                     items-center justify-center hidden group-hover:flex"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                             border border-dashed transition-colors"
                  style={{
                    borderColor: cat.color + '50',
                    color: cat.color + 'aa',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = cat.color
                    e.currentTarget.style.color = cat.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = cat.color + '50'
                    e.currentTarget.style.color = cat.color + 'aa'
                  }}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Agregar fotos
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
