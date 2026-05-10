'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_COLORS, TIPO_ICONS } from '@/lib/geo/constants'
import type { Asset } from '@/lib/geo/types'

interface AssetListProps {
  assets: Asset[]
  selectedId: string | null
  onSelect: (asset: Asset) => void
}

const STATUS_BG: Record<string, string> = {
  'Operativo':          'bg-emerald-500',
  'En mantenimiento':   'bg-amber-400',
  'Fuera de servicio':  'bg-red-500',
}

export default function AssetList({ assets, selectedId, onSelect }: AssetListProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return assets
    return assets.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q) ||
        a.tipo.toLowerCase().includes(q),
    )
  }, [assets, search])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search */}
      <div className="relative shrink-0 mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50
                     text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          placeholder="Buscar activo o TAG…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Count */}
      <p className="text-[10px] text-slate-600 mb-1.5 shrink-0 px-0.5">
        {filtered.length} activo{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">Sin resultados</p>
        ) : (
          filtered.map((asset) => {
            const isSelected = asset.id === selectedId
            const color = STATUS_COLORS[asset.status] ?? '#94a3b8'
            const icon = TIPO_ICONS[asset.tipo] ?? TIPO_ICONS.default
            return (
              <button
                key={asset.id}
                onClick={() => onSelect(asset)}
                className={cn(
                  'w-full text-left px-2.5 py-2 rounded-xl border transition-colors',
                  isSelected
                    ? 'bg-[#E1F5EE] border-[#5DCAA5] text-slate-800'
                    : 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/60 text-slate-300',
                )}
              >
                <div className="flex items-start gap-2">
                  {/* Status dot */}
                  <span
                    className={cn('mt-1 w-2 h-2 rounded-full shrink-0', STATUS_BG[asset.status])}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm leading-none">{icon}</span>
                      <p className={cn(
                        'text-xs font-medium truncate',
                        isSelected ? 'text-slate-800' : 'text-slate-200',
                      )}>
                        {asset.nombre}
                      </p>
                    </div>
                    <p className={cn(
                      'text-[10px] font-mono truncate mt-0.5',
                      isSelected ? 'text-slate-600' : 'text-slate-500',
                    )}>
                      {asset.tag}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: color }}
                  >
                    {asset.status === 'En mantenimiento' ? 'Mant.' : asset.status}
                  </span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
