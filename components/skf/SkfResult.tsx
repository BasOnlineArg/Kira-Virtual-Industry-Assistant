'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle, Clock, FileText, Loader2 } from 'lucide-react'
import IsoGauge from './IsoGauge'

export interface SkfAnalysisResult {
  id: string | null
  tag: string
  zone: 'A' | 'B' | 'C' | 'D'
  estado: 'verde' | 'amarillo' | 'rojo'
  diagnostico: string
  probabilidad_falla: number | null
  rul: string | null
  patron_falla: string | null
  recomendaciones: string | null
  fecha: string
  inspector_name: string
  // measurement snapshot (worst point)
  velocityRms: number
  envelopeGe: number
  temperatura: number
  isoClass: string
  tipoEquipo?: string
  puntoMedicion?: string
  rpm?: number
  points?: Array<{ punto: string; velocityRms: number; envelopeGe: number; temperatura: number }>
}

interface SkfResultProps {
  result: SkfAnalysisResult
}

function Section({ icon: Icon, title, content, color = 'text-sky-400' }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  content: string
  color?: string
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

async function exportDocx(result: SkfAnalysisResult) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: `Informe SKF QuickCollect — ${result.tag}`, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Fecha: ${new Date(result.fecha).toLocaleString('es-AR')}` }),
        new Paragraph({ text: `Inspector: ${result.inspector_name}` }),
        new Paragraph({ text: `Tipo de equipo: ${result.tipoEquipo || 'N/D'}` }),
        new Paragraph({ text: `Punto de medición: ${result.puntoMedicion || 'N/D'}` }),
        new Paragraph({ text: `RPM: ${result.rpm?.toFixed(0) ?? 'N/D'}` }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'MEDICIONES', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun(`Velocidad RMS: ${result.velocityRms.toFixed(2)} mm/s`)] }),
        new Paragraph({ children: [new TextRun(`Envolvente gE: ${result.envelopeGe.toFixed(3)} gE`)] }),
        new Paragraph({ children: [new TextRun(`Temperatura: ${result.temperatura.toFixed(1)} °C`)] }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'EVALUACIÓN ISO 10816', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun(`Clase ISO: ${result.isoClass}`)] }),
        new Paragraph({ children: [new TextRun(`Zona: ${result.zone}`)] }),
        new Paragraph({ children: [new TextRun(`Estado: ${result.estado.toUpperCase()}`)] }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'DIAGNÓSTICO KIRA', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: result.diagnostico }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'PROBABILIDAD DE FALLA', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: `${result.probabilidad_falla ?? 'N/D'}%` }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'RUL (Vida Útil Remanente)', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: result.rul ?? 'N/D' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'PATRÓN DE FALLA', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: result.patron_falla ?? 'N/D' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'RECOMENDACIONES', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: result.recomendaciones ?? 'N/D' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Generado por KIRA — Asistente Virtual Industrial' }),
        new Paragraph({ text: 'Norma: ISO 10816 · SKF QuickCollect' }),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `skf_${result.tag}_${new Date(result.fecha).toISOString().slice(0, 10)}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SkfResult({ result }: SkfResultProps) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try { await exportDocx(result) }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnóstico KIRA — SKF</p>
          <p className="text-base font-semibold text-slate-100 mt-0.5">{result.tag}</p>
          <p className="text-xs text-slate-500">
            {new Date(result.fecha).toLocaleString('es-AR')} · {result.inspector_name}
            {result.puntoMedicion && ` · ${result.puntoMedicion}`}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-700 border border-sky-600
                     text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {exporting
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Exportando…</>
            : <><FileText className="w-3.5 h-3.5" />Informe DOCX</>
          }
        </button>
      </div>

      {/* ISO Gauge */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Estado ISO 10816
        </p>
        <IsoGauge
          velocityRms={result.velocityRms}
          isoClass={result.isoClass}
          zone={result.zone}
          estado={result.estado}
        />
      </div>

      {/* Measurements summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Velocidad RMS', value: `${result.velocityRms.toFixed(2)} mm/s` },
          { label: 'Envolvente gE', value: `${result.envelopeGe.toFixed(3)} gE` },
          { label: 'Temperatura',   value: `${result.temperatura.toFixed(1)} °C` },
        ].map((m) => (
          <div key={m.label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</p>
            <p className="text-base font-mono font-semibold text-slate-100 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Probability + RUL */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Prob. falla</p>
          <p className={`text-3xl font-mono font-bold ${
            (result.probabilidad_falla ?? 0) < 30 ? 'text-emerald-400' :
            (result.probabilidad_falla ?? 0) < 60 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {result.probabilidad_falla ?? '—'}%
          </p>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (result.probabilidad_falla ?? 0) < 30 ? 'bg-emerald-500' :
                (result.probabilidad_falla ?? 0) < 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.probabilidad_falla ?? 0}%` }}
            />
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-center flex flex-col items-center justify-center">
          <Clock className="w-5 h-5 text-violet-400 mb-1" />
          <p className="text-xl font-mono font-bold text-violet-300">{result.rul ?? '—'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">RUL</p>
        </div>
      </div>

      {/* Sections */}
      <Section icon={AlertTriangle} title="Diagnóstico" content={result.diagnostico} color="text-sky-400" />
      {result.patron_falla && (
        <Section icon={AlertTriangle} title="Patrón de falla" content={result.patron_falla} color="text-amber-400" />
      )}
      {result.recomendaciones && (
        <Section icon={CheckCircle} title="Recomendaciones" content={result.recomendaciones} color="text-emerald-400" />
      )}

      <p className="text-[10px] text-slate-600 text-center">ISO 10816 · SKF QuickCollect</p>
    </div>
  )
}
