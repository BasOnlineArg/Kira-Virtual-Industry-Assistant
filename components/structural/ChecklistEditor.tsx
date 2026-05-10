'use client'

import { cn } from '@/lib/utils'
import { type ChecklistCategory, SCORE_LABELS } from '@/lib/structural/templates'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ChecklistEditorProps {
  categories: ChecklistCategory[]
  onChange: (categories: ChecklistCategory[]) => void
  disabled?: boolean
}

function ScoreButton({
  value,
  selected,
  onClick,
  disabled,
}: {
  value: number
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  const cfg = SCORE_LABELS[value]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={cfg.label}
      className={cn(
        'w-8 h-8 rounded-lg text-xs font-bold transition-all border',
        selected
          ? cn(cfg.color, 'border-transparent scale-110 shadow-lg')
          : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
      )}
    >
      {value}
    </button>
  )
}

function CategoryBlock({
  cat,
  catIdx,
  categories,
  onChange,
  disabled,
}: {
  cat: ChecklistCategory
  catIdx: number
  categories: ChecklistCategory[]
  onChange: (c: ChecklistCategory[]) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(true)

  const scored = cat.items.filter((i) => i.score > 0)
  const avg = scored.length > 0
    ? scored.reduce((s, i) => s + i.score, 0) / scored.length
    : null

  const avgColor = avg === null ? 'text-slate-600'
    : avg >= 4 ? 'text-emerald-400'
    : avg >= 3 ? 'text-amber-400'
    : 'text-red-400'

  function setScore(itemIdx: number, score: number) {
    const next = categories.map((c, ci) =>
      ci !== catIdx ? c : {
        ...c,
        items: c.items.map((it, ii) =>
          ii !== itemIdx ? it : { ...it, score }
        ),
      }
    )
    onChange(next)
  }

  function setObs(itemIdx: number, obs: string) {
    const next = categories.map((c, ci) =>
      ci !== catIdx ? c : {
        ...c,
        items: c.items.map((it, ii) =>
          ii !== itemIdx ? it : { ...it, observacion: obs }
        ),
      }
    )
    onChange(next)
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          <span className="text-sm font-medium text-slate-200">{cat.categoria}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">{scored.length}/{cat.items.length} evaluados</span>
          {avg !== null && (
            <span className={cn('text-xs font-mono font-semibold', avgColor)}>
              {avg.toFixed(1)}/5
            </span>
          )}
        </div>
      </button>

      {/* Items */}
      {open && (
        <div className="divide-y divide-slate-700/30 border-t border-slate-700/40">
          {cat.items.map((it, itemIdx) => (
            <div key={it.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-slate-300 flex-1 leading-relaxed">{it.item}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <ScoreButton
                      key={v}
                      value={v}
                      selected={it.score === v}
                      onClick={() => setScore(itemIdx, it.score === v ? 0 : v)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
              {it.score > 0 && it.score <= 3 && (
                <input
                  type="text"
                  placeholder="Observación (requerida para score ≤ 3)…"
                  value={it.observacion}
                  onChange={(e) => setObs(itemIdx, e.target.value)}
                  disabled={disabled}
                  className="w-full px-2 py-1.5 text-xs bg-slate-900/60 border border-slate-600/50 rounded-lg
                             text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              )}
              {it.score > 0 && (
                <p className={cn('text-[10px] font-semibold', SCORE_LABELS[it.score].color.includes('text-white') ? 'text-slate-400' : '')}>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px]', SCORE_LABELS[it.score].color)}>
                    {SCORE_LABELS[it.score].label}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChecklistEditor({ categories, onChange, disabled }: ChecklistEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Formulario de relevamiento (FRM)
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-600">
          {[1, 2, 3, 4, 5].map((v) => (
            <span key={v} className={cn('px-1.5 py-0.5 rounded font-semibold', SCORE_LABELS[v].color)}>
              {v} {SCORE_LABELS[v].label}
            </span>
          ))}
        </div>
      </div>

      {categories.map((cat, catIdx) => (
        <CategoryBlock
          key={cat.categoria}
          cat={cat}
          catIdx={catIdx}
          categories={categories}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
