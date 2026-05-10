'use client'

import { cn } from '@/lib/utils'
import type { AudioMetrics } from '@/lib/dsp/processor'

function kurtosisInterpretation(k: number): { label: string; color: string } {
  if (k < 3) return { label: 'Normal', color: 'text-emerald-400' }
  if (k < 6) return { label: 'Alerta', color: 'text-amber-400' }
  if (k < 10) return { label: 'Falla incipiente', color: 'text-orange-400' }
  return { label: 'Falla avanzada', color: 'text-red-400' }
}

function crestInterpretation(cf: number): { label: string; color: string } {
  if (cf < 2.5) return { label: 'Normal', color: 'text-emerald-400' }
  if (cf < 3.5) return { label: 'Moderado', color: 'text-amber-400' }
  if (cf < 5) return { label: 'Elevado', color: 'text-orange-400' }
  return { label: 'Severo', color: 'text-red-400' }
}

function aeaInterpretation(pct: number): { label: string; color: string } {
  if (pct < 5) return { label: 'Bajo', color: 'text-emerald-400' }
  if (pct < 15) return { label: 'Moderado', color: 'text-amber-400' }
  if (pct < 30) return { label: 'Elevado', color: 'text-orange-400' }
  return { label: 'Muy elevado', color: 'text-red-400' }
}

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  badge?: { label: string; color: string }
}

function MetricCard({ label, value, sub, badge }: MetricCardProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-mono font-semibold text-slate-100">{value}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      {badge && (
        <span className={cn('text-xs font-medium mt-1 block', badge.color)}>{badge.label}</span>
      )}
    </div>
  )
}

interface MetricsPanelProps {
  metrics: AudioMetrics
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  const kurtInterp = kurtosisInterpretation(metrics.kurtosis)
  const crestInterp = crestInterpretation(metrics.crestFactor)
  const aeaInterp = aeaInterpretation(metrics.aeaPercentage)

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Métricas computadas
      </p>

      {/* Top metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="RMS"
          value={metrics.rms.toExponential(3)}
          sub="Nivel de vibración normalizado"
        />
        <MetricCard
          label="Kurtosis"
          value={metrics.kurtosis.toFixed(2)}
          sub="Indicador de impactos"
          badge={kurtInterp}
        />
        <MetricCard
          label="Factor de cresta"
          value={metrics.crestFactor.toFixed(2)}
          sub="Pico / RMS"
          badge={crestInterp}
        />
        <MetricCard
          label="AEA > 2kHz"
          value={metrics.aeaPercentage.toFixed(1) + '%'}
          sub="Energía alta frecuencia"
          badge={aeaInterp}
        />
      </div>

      {/* Signal info */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Señal</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Duración</span>
            <span className="text-slate-300 font-mono">{metrics.duration.toFixed(2)} s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fs</span>
            <span className="text-slate-300 font-mono">{metrics.sampleRate.toLocaleString()} Hz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Muestras</span>
            <span className="text-slate-300 font-mono">{metrics.nSamples.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Frec. dom.</span>
            <span className="text-slate-300 font-mono">{metrics.dominantFrequency.toFixed(1)} Hz</span>
          </div>
        </div>
      </div>

      {/* Peak frequencies */}
      {metrics.peakFrequencies.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Picos espectrales
          </p>
          <div className="space-y-1.5">
            {metrics.peakFrequencies.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">{p.frequency.toFixed(1)} Hz</span>
                <div className="flex-1 mx-3">
                  <div
                    className="h-1 bg-sky-500/40 rounded-full"
                    style={{
                      width: `${Math.min(100, ((p.magnitudeDb + 100) / 80) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-slate-500 font-mono">{p.magnitudeDb.toFixed(1)} dB</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
