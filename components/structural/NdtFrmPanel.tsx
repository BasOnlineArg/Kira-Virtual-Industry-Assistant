'use client'

import { cn } from '@/lib/utils'
import { NDT_TOOLS, FRM_RISKS } from '@/lib/structural/constants'
import { AlertTriangle, Wrench } from 'lucide-react'

interface NdtFrmPanelProps {
  selectedNdt: string[]
  selectedFrm: string[]
  onNdtChange: (ids: string[]) => void
  onFrmChange: (ids: string[]) => void
  disabled?: boolean
}

function Toggle({
  id, label, icon, selected, onToggle, disabled, accent,
}: {
  id: string; label: string; icon?: string
  selected: boolean; onToggle: () => void; disabled?: boolean; accent: string
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors text-left',
        selected
          ? accent
          : 'border-slate-700/50 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:border-slate-600'
      )}
    >
      {icon && <span className="text-sm leading-none">{icon}</span>}
      <span className="leading-snug">{label}</span>
    </button>
  )
}

export default function NdtFrmPanel({
  selectedNdt, selectedFrm, onNdtChange, onFrmChange, disabled,
}: NdtFrmPanelProps) {
  function toggleNdt(id: string) {
    onNdtChange(
      selectedNdt.includes(id) ? selectedNdt.filter((x) => x !== id) : [...selectedNdt, id]
    )
  }
  function toggleFrm(id: string) {
    onFrmChange(
      selectedFrm.includes(id) ? selectedFrm.filter((x) => x !== id) : [...selectedFrm, id]
    )
  }

  return (
    <div className="space-y-4">
      {/* NDT Tools */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-3.5 h-3.5 text-slate-500" />
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Herramientas NDT aplicadas
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NDT_TOOLS.map((t) => (
            <Toggle
              key={t.id} id={t.id} label={t.label}
              selected={selectedNdt.includes(t.id)}
              onToggle={() => toggleNdt(t.id)}
              disabled={disabled}
              accent="border-sky-500/40 bg-sky-500/10 text-sky-300"
            />
          ))}
        </div>
      </div>

      {/* FRM Risks */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Gestión de riesgos fatales (FRM)
          </p>
        </div>
        {selectedFrm.length > 0 && (
          <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-[10px] text-red-400 font-semibold">
              ⚠️ {selectedFrm.length} protocolo{selectedFrm.length > 1 ? 's' : ''} de riesgo fatal activado{selectedFrm.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {FRM_RISKS.map((r) => (
            <Toggle
              key={r.id} id={r.id} label={r.label} icon={r.icon}
              selected={selectedFrm.includes(r.id)}
              onToggle={() => toggleFrm(r.id)}
              disabled={disabled}
              accent="border-red-500/40 bg-red-500/10 text-red-300"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
