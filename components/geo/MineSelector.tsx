'use client'

import { cn } from '@/lib/utils'
import { MINE_CONFIG } from '@/lib/geo/constants'
import type { MineId } from '@/lib/geo/types'

interface MineSelectorProps {
  activeMine: MineId
  onChange: (mine: MineId) => void
}

export default function MineSelector({ activeMine, onChange }: MineSelectorProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
        Mina subterránea
      </p>
      {MINE_CONFIG.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors text-left',
            activeMine === m.id
              ? 'text-white border-transparent'
              : 'border-slate-700/50 bg-slate-900/30 text-slate-300 hover:bg-slate-800/60',
          )}
          style={activeMine === m.id ? { backgroundColor: m.color, borderColor: m.color } : {}}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: m.color }}
          />
          {m.label}
        </button>
      ))}
    </div>
  )
}
