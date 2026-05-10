'use client'

import { Filter, Wind } from 'lucide-react'
import type { DspConfig } from '@/lib/dsp/processor'
import { cn } from '@/lib/utils'

interface FilterControlsProps {
  config: DspConfig
  onChange: (config: DspConfig) => void
  disabled?: boolean
}

export default function FilterControls({ config, onChange, disabled }: FilterControlsProps) {
  const bandpassEnabled = !!config.bandpass
  const wNrEnabled = !!config.whiteNoiseReduction

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtros opcionales</p>

      {/* Band-pass */}
      <div className={cn('p-3 rounded-lg border transition-colors', bandpassEnabled ? 'border-sky-500/30 bg-sky-500/5' : 'border-slate-700/50 bg-slate-900/30')}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-300">Band-pass</span>
          </div>
          <button
            onClick={() =>
              onChange({
                ...config,
                bandpass: bandpassEnabled ? null : { low: 10, high: 5000 },
              })
            }
            disabled={disabled}
            className={cn(
              'relative w-9 h-5 rounded-full transition-colors',
              bandpassEnabled ? 'bg-sky-600' : 'bg-slate-700'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                bandpassEnabled ? 'left-4' : 'left-0.5'
              )}
            />
          </button>
        </div>
        {bandpassEnabled && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Frec. baja (Hz)</label>
              <input
                type="number"
                min={1}
                max={config.bandpass?.high ?? 5000}
                value={config.bandpass?.low ?? 10}
                onChange={(e) =>
                  onChange({ ...config, bandpass: { low: +e.target.value, high: config.bandpass?.high ?? 5000 } })
                }
                disabled={disabled}
                className="w-full mt-1 px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Frec. alta (Hz)</label>
              <input
                type="number"
                min={config.bandpass?.low ?? 10}
                max={20000}
                value={config.bandpass?.high ?? 5000}
                onChange={(e) =>
                  onChange({ ...config, bandpass: { low: config.bandpass?.low ?? 10, high: +e.target.value } })
                }
                disabled={disabled}
                className="w-full mt-1 px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* White noise reduction */}
      <div className={cn('p-3 rounded-lg border transition-colors', wNrEnabled ? 'border-sky-500/30 bg-sky-500/5' : 'border-slate-700/50 bg-slate-900/30')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <div>
              <span className="text-xs font-medium text-slate-300">Reducción ruido blanco</span>
              <p className="text-[10px] text-slate-600">Sustracción espectral</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...config, whiteNoiseReduction: !wNrEnabled })}
            disabled={disabled}
            className={cn(
              'relative w-9 h-5 rounded-full transition-colors',
              wNrEnabled ? 'bg-sky-600' : 'bg-slate-700'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                wNrEnabled ? 'left-4' : 'left-0.5'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
