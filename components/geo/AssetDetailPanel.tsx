'use client'

import { X, CheckCircle, AlertTriangle, MapPin, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_COLORS, MINE_CONFIG, TIPO_ICONS } from '@/lib/geo/constants'
import type { Asset } from '@/lib/geo/types'

interface AssetDetailPanelProps {
  asset: Asset
  onClose: () => void
}

function StatusBadge({ status }: { status: Asset['status'] }) {
  const color = STATUS_COLORS[status] ?? '#94a3b8'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {status}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-800/60 last:border-0">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-xs text-slate-300 text-right">{value}</span>
    </div>
  )
}

export default function AssetDetailPanel({ asset, onClose }: AssetDetailPanelProps) {
  const icon = TIPO_ICONS[asset.tipo] ?? TIPO_ICONS.default
  const mine = asset.mina ? MINE_CONFIG.find((m) => m.id === asset.mina) : null

  const conformes  = asset.checklist?.filter((c) => c.resultado).length ?? 0
  const totalCheck = asset.checklist?.length ?? 0

  const coordLabel =
    asset.capa === 'superficie'
      ? asset.lat != null && asset.lng != null
        ? `${asset.lat.toFixed(5)}, ${asset.lng.toFixed(5)}`
        : '—'
      : asset.ug_x != null && asset.ug_y != null
        ? `MC ${asset.ug_y} / Col ${asset.ug_x}`
        : '—'

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-2xl leading-none mt-0.5">{icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 leading-snug">{asset.nombre}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{asset.tag}</p>
              {mine && (
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: mine.color }}
                >
                  {mine.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Info general */}
        <section>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Información general
          </p>
          <div className="bg-slate-800/40 rounded-xl px-3 divide-y divide-slate-800/60">
            <InfoRow label="Tipo"       value={asset.tipo} />
            {asset.ubicacion && <InfoRow label="Ubicación"  value={asset.ubicacion} />}
            <InfoRow label="Status"     value={<StatusBadge status={asset.status} />} />
            {asset.estado && <InfoRow label="Estado"     value={asset.estado} />}
            {asset.inspector_asignado && (
              <InfoRow
                label="Inspector"
                value={
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {asset.inspector_asignado}
                  </span>
                }
              />
            )}
            <InfoRow
              label="Coordenadas"
              value={
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span className="font-mono text-[10px]">{coordLabel}</span>
                </span>
              }
            />
          </div>
        </section>

        {/* Inspecciones */}
        <section>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Inspecciones
          </p>
          <div className="bg-slate-800/40 rounded-xl px-3 divide-y divide-slate-800/60">
            {asset.ultima_inspeccion && (
              <InfoRow
                label="Última"
                value={
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(asset.ultima_inspeccion + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                }
              />
            )}
            {asset.proxima_inspeccion && (
              <InfoRow
                label="Próxima"
                value={
                  <span className="flex items-center gap-1 text-violet-300">
                    <Clock className="w-3 h-3" />
                    {new Date(asset.proxima_inspeccion + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                }
              />
            )}
          </div>
        </section>

        {/* Checklist */}
        {asset.checklist && asset.checklist.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Checklist
              </p>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                conformes === totalCheck
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400',
              )}>
                {conformes}/{totalCheck} conformes
              </span>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-2 space-y-1">
              {asset.checklist.map((item, i) => (
                <div key={i} className="px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-start gap-2">
                    {item.resultado ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-[11px] text-slate-300 leading-snug">{item.descripcion}</p>
                      {!item.resultado && item.nota && (
                        <p className="text-[10px] text-amber-400/80 mt-0.5 leading-snug">{item.nota}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Historial */}
        {asset.historial && asset.historial.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Historial
            </p>
            <div className="space-y-1.5">
              {asset.historial.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30"
                >
                  <span className={cn(
                    'mt-0.5 w-2 h-2 rounded-full shrink-0',
                    h.estado === 'ok' ? 'bg-emerald-400' : 'bg-amber-400',
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-300 leading-snug">{h.texto}</p>
                    <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                      {new Date(h.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                    h.estado === 'ok'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400',
                  )}>
                    {h.estado === 'ok' ? 'OK' : 'OBS'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
