'use client'

import { useState, useEffect } from 'react'
import { Search, CalendarRange, Brain, X, Download, Loader2, Clock } from 'lucide-react'
import type { W5H2, AnalysisResult } from './types'
import { cn } from '@/lib/utils'

interface HistoryItem {
  id:             string
  created_at:     string
  inspector_name: string
  w5h2:           W5H2
  analysis_result: AnalysisResult | null
}

const RISK_CFG = {
  'Crítico': { c: 'text-red-400',     bg: 'bg-red-500/10',    b: 'border-red-500/30'     },
  'Alto':    { c: 'text-orange-400',  bg: 'bg-orange-500/10', b: 'border-orange-500/30'  },
  'Medio':   { c: 'text-amber-400',   bg: 'bg-amber-500/10',  b: 'border-amber-500/30'   },
  'Bajo':    { c: 'text-emerald-400', bg: 'bg-emerald-500/10',b: 'border-emerald-500/30' },
} as const

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function buildPrintHtml(item: HistoryItem) {
  const a = item.analysis_result
  const date = fmtDate(item.created_at)
  const riskColor: Record<string, string> = {
    'Crítico': '#ef4444', 'Alto': '#f97316', 'Medio': '#f59e0b', 'Bajo': '#22c55e',
  }
  const rc = a ? riskColor[a.nivelRiesgoResidual] ?? '#64748b' : '#64748b'

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <title>RCA — ${item.w5h2.what}</title>
  <style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:24px 32px;font-size:13px}
    h1{font-size:20px;margin-bottom:4px}h2{font-size:15px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-top:22px}
    h3{font-size:13px;color:#334155;margin:10px 0 4px}.badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:700}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin:10px 0}
    .field label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
    .field p{margin:2px 0 0;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#f1f5f9;padding:8px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase}
    td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px}
    .sig{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:40px}
    .sig-box{border-top:1px solid #cbd5e1;padding-top:8px}.sig-box p{margin:2px 0;font-size:12px;color:#64748b}
    @media print{body{padding:16px}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
    <div><h1>Informe de Análisis RCA</h1>
    <p style="color:#64748b;margin:0;font-size:12px">KIRA · ${date} · ${item.inspector_name}</p></div>
    ${a ? `<span class="badge" style="background:${rc}22;color:${rc};border:1px solid ${rc}55">Riesgo ${a.nivelRiesgoResidual}</span>` : ''}
  </div>
  <h2>1. Descripción del evento (5W2H)</h2>
  <div class="grid">
    <div class="field"><label>¿Qué ocurrió?</label><p>${item.w5h2.what}</p></div>
    <div class="field"><label>¿Quién?</label><p>${item.w5h2.who}</p></div>
    <div class="field"><label>¿Dónde?</label><p>${item.w5h2.where}</p></div>
    <div class="field"><label>¿Cuándo?</label><p>${item.w5h2.when}</p></div>
    <div class="field"><label>¿Cómo?</label><p>${item.w5h2.how}</p></div>
    ${item.w5h2.why ? `<div class="field"><label>Causa aparente</label><p>${item.w5h2.why}</p></div>` : ''}
    ${item.w5h2.how_much ? `<div class="field"><label>Impacto/Costo</label><p>${item.w5h2.how_much}</p></div>` : ''}
  </div>
  ${a ? `
  <h2>2. Resultado del Análisis IA</h2>
  <h3>Causa Raíz</h3>
  <p style="background:#fef2f2;border-left:3px solid #ef4444;padding:10px 14px;border-radius:4px;color:#7f1d1d">${a.causaRaiz}</p>
  <h3>Causas Contribuyentes</h3>
  <ul style="padding-left:18px">${a.causasContribuyentes.map((c) => `<li style="color:#475569;margin-bottom:4px">${c}</li>`).join('')}</ul>
  <h3>Acciones Correctivas</h3>
  <table><thead><tr><th>Acción</th><th>Responsable</th><th>Plazo</th></tr></thead>
  <tbody>${a.accionesCorrectivas.map((ac, i) => `<tr><td>${i + 1}. ${ac.accion}</td><td>${ac.responsable}</td><td>${ac.plazo}</td></tr>`).join('')}</tbody></table>
  <h3>Lecciones Aprendidas</h3>
  <ul style="padding-left:18px">${a.leccionesAprendidas.map((l) => `<li style="color:#475569;margin-bottom:4px">${l}</li>`).join('')}</ul>
  <h3>Conclusión Ejecutiva</h3>
  <p style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px 16px;border-radius:6px;line-height:1.7;color:#334155">${a.conclusionEjecutiva}</p>
  ` : ''}
  <div class="sig">
    <div class="sig-box"><p style="font-weight:600;color:#1e293b">${item.inspector_name}</p><p>Inspector / Responsable</p></div>
    <div class="sig-box"><p style="font-weight:600;color:#1e293b">___________________________</p><p>Jefe de Área / Supervisor</p></div>
  </div>
</body></html>`
}

// ── Detail modal ───────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }: { item: HistoryItem; onClose: () => void }) {
  const a = item.analysis_result
  const riskCfg = a ? (RISK_CFG[a.nivelRiesgoResidual] ?? RISK_CFG['Medio']) : null

  function handlePrint() {
    const win = window.open('', '_blank', 'width=960,height=750')
    if (!win) return
    win.document.write(buildPrintHtml(item))
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Análisis RCA · {fmtDate(item.created_at)}</p>
            <h3 className="text-sm font-semibold text-slate-200 leading-tight truncate mt-0.5">
              {item.w5h2.what}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {riskCfg && (
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', riskCfg.bg, riskCfg.b, riskCfg.c)}>
                {a?.nivelRiesgoResidual}
              </span>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700
                         text-slate-300 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="overflow-auto p-5 space-y-5">

          {/* 5W2H grid */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción del evento</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: '¿Qué?',    val: item.w5h2.what  },
                { label: '¿Quién?',  val: item.w5h2.who   },
                { label: '¿Dónde?',  val: item.w5h2.where },
                { label: '¿Cuándo?', val: item.w5h2.when  },
                { label: '¿Cómo?',   val: item.w5h2.how   },
                ...(item.w5h2.why      ? [{ label: 'Causa aparente', val: item.w5h2.why }]      : []),
                ...(item.w5h2.how_much ? [{ label: 'Impacto/Costo',  val: item.w5h2.how_much }] : []),
              ] as { label: string; val: string }[]).map((f) => (
                <div key={f.label} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-xs text-slate-300">{f.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-slate-600">Inspector:</span>
            <span className="text-slate-400">{item.inspector_name}</span>
          </div>

          {/* Analysis result */}
          {a ? (
            <>
              {/* Causa raíz */}
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Causa Raíz</p>
                <p className="text-sm text-slate-300">{a.causaRaiz}</p>
              </div>

              {/* Causas contribuyentes */}
              <div>
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Causas Contribuyentes</p>
                <ul className="space-y-1">
                  {a.causasContribuyentes.map((c, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-amber-500 shrink-0">▸</span>{c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acciones correctivas */}
              <div>
                <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mb-1.5">Acciones Correctivas</p>
                <div className="space-y-1.5">
                  {a.accionesCorrectivas.map((ac, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
                      <p className="text-xs text-slate-300 mb-1">{ac.accion}</p>
                      <div className="flex gap-3 text-[10px] text-slate-500">
                        <span>👤 {ac.responsable}</span>
                        <span>📅 {ac.plazo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lecciones + patrones */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Lecciones</p>
                  <ul className="space-y-1">
                    {a.leccionesAprendidas.map((l, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-slate-400">
                        <span className="text-emerald-500 shrink-0">▸</span>{l}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Patrones</p>
                  <ul className="space-y-1">
                    {a.patronesMonitorear.map((p, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-slate-400">
                        <span className="text-amber-500 shrink-0">▸</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conclusión */}
              <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-1">Conclusión Ejecutiva</p>
                <p className="text-xs text-slate-400 leading-relaxed">{a.conclusionEjecutiva}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">Sin análisis IA registrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main history component ─────────────────────────────────────────────────────
export default function RcaHistory() {
  const [items, setItems]       = useState<HistoryItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [selected, setSelected] = useState<HistoryItem | null>(null)

  useEffect(() => {
    fetch('/api/rca')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((item) => {
    const q = query.toLowerCase()
    const matchQ = !q
      || (item.w5h2?.what ?? '').toLowerCase().includes(q)
      || (item.inspector_name ?? '').toLowerCase().includes(q)
      || (item.w5h2?.where ?? '').toLowerCase().includes(q)
    const d = item.created_at.slice(0, 10)
    const matchFrom = !dateFrom || d >= dateFrom
    const matchTo   = !dateTo   || d <= dateTo
    return matchQ && matchFrom && matchTo
  })

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-auto">

      {/* Search bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por evento, inspector, ubicación..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm
                       text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <CalendarRange className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-300
                       focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <span className="text-slate-600 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-300
                       focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        {filtered.length} análisis{filtered.length !== 1 ? '' : ''}{query || dateFrom || dateTo ? ` de ${items.length} total` : ''}
      </p>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
          <Brain className="w-8 h-8 opacity-30" />
          <p className="text-sm">{items.length === 0 ? 'Sin análisis guardados' : 'Sin resultados para los filtros aplicados'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const a    = item.analysis_result
            const risk = a?.nivelRiesgoResidual
            const rcfg = risk ? (RISK_CFG[risk] ?? null) : null

            return (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 text-left
                           hover:border-slate-600 hover:bg-slate-800/70 transition-all group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20
                                  flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                  {rcfg ? (
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                      rcfg.bg, rcfg.b, rcfg.c)}>
                      {risk}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700/50 text-slate-500 border border-slate-600/30 shrink-0">
                      Sin análisis
                    </span>
                  )}
                </div>

                {/* Event name */}
                <p className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight mb-2">
                  {item.w5h2.what}
                </p>

                {/* Causa raíz preview */}
                {a?.causaRaiz && (
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                    {a.causaRaiz}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{fmtDate(item.created_at)}</span>
                </div>
                {item.inspector_name && (
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {item.w5h2.where && <span>{item.w5h2.where} · </span>}
                    {item.inspector_name}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
