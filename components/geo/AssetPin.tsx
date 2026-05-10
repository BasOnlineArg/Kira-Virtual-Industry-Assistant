'use client'

import { STATUS_COLORS } from '@/lib/geo/constants'
import type { Asset } from '@/lib/geo/types'

interface AssetPinProps {
  asset: Asset
  selected: boolean
  onClick: () => void
}

export default function AssetPin({ asset, selected, onClick }: AssetPinProps) {
  const color = STATUS_COLORS[asset.status] ?? '#94a3b8'
  const size  = selected ? 28 : 22

  return (
    /* The parent already positions this element (absolute + left/top).
       We translate by -50% so the pin tip is centered on the coordinate. */
    <div
      onClick={onClick}
      title={`${asset.nombre} — ${asset.tag}`}
      className="relative cursor-pointer group"
      style={{
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        zIndex: selected ? 20 : 10,
      }}
    >
      {/* Drop shape: square rotated 45° */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          backgroundColor: color,
          border: `2.5px solid ${selected ? '#fff' : 'rgba(255,255,255,0.7)'}`,
          boxShadow: selected
            ? `0 0 0 3px ${color}55, 0 4px 12px rgba(0,0,0,0.5)`
            : '0 2px 6px rgba(0,0,0,0.4)',
          transition: 'all 0.15s',
        }}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
          <p className="text-xs font-semibold text-slate-100">{asset.nombre}</p>
          <p className="text-[10px] font-mono text-slate-400">{asset.tag}</p>
        </div>
        <div className="w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  )
}
