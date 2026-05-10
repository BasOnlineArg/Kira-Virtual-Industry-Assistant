'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  FileText,
  Download,
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AudioMetrics } from '@/lib/dsp/processor'

interface AnalysisResult {
  id: string | null
  tag: string
  diagnostico: string
  probabilidad_falla: number | null
  rul: string | null
  patron_falla: string | null
  frecuencias_caracteristicas: string | null
  recomendaciones: string | null
  metrics: AudioMetrics
  fecha: string
  inspector_name: string
}

interface SonomatResultProps {
  result: AnalysisResult
  tipoEquipo: string
}

function ProbabilityGauge({ value }: { value: number }) {
  const color =
    value < 30 ? 'text-emerald-400' : value < 60 ? 'text-amber-400' : 'text-red-400'
  const bgColor =
    value < 30 ? 'bg-emerald-500' : value < 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="text-center">
      <div className={cn('text-4xl font-mono font-bold', color)}>{value}%</div>
      <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', bgColor)}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
        Probabilidad de falla
      </p>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  content,
  accent = 'sky',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  content: string
  accent?: string
}) {
  const accentMap: Record<string, string> = {
    sky: 'text-sky-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
  }
  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', accentMap[accent] ?? 'text-sky-400')} />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

async function exportDocx(result: AnalysisResult, tipoEquipo: string) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `Informe Sonomat — ${result.tag}`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: `Fecha: ${new Date(result.fecha).toLocaleString('es-AR')}` }),
          new Paragraph({ text: `Inspector: ${result.inspector_name}` }),
          new Paragraph({ text: `Tipo de equipo: ${tipoEquipo || 'N/D'}` }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'DIAGNÓSTICO', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: result.diagnostico }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'MÉTRICAS', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun(`RMS: ${result.metrics.rms.toExponential(3)}`)] }),
          new Paragraph({ children: [new TextRun(`Kurtosis: ${result.metrics.kurtosis.toFixed(2)}`)] }),
          new Paragraph({ children: [new TextRun(`Factor de cresta: ${result.metrics.crestFactor.toFixed(2)}`)] }),
          new Paragraph({ children: [new TextRun(`AEA >2kHz: ${result.metrics.aeaPercentage.toFixed(1)}%`)] }),
          new Paragraph({ children: [new TextRun(`Frec. dominante: ${result.metrics.dominantFrequency.toFixed(1)} Hz`)] }),
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
          new Paragraph({ text: 'FRECUENCIAS CARACTERÍSTICAS', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: result.frecuencias_caracteristicas ?? 'N/D' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'RECOMENDACIONES', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: result.recomendaciones ?? 'N/D' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Generado por KIRA — Asistente Virtual Industrial', }),
          new Paragraph({ text: 'Normas: ISO 10816 · ISO 13373 · ISO 18436-2' }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sonomat_${result.tag}_${new Date(result.fecha).toISOString().slice(0, 10)}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportZip(result: AnalysisResult, tipoEquipo: string) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  const summary = [
    `INFORME SONOMAT — ${result.tag}`,
    `Fecha: ${new Date(result.fecha).toLocaleString('es-AR')}`,
    `Inspector: ${result.inspector_name}`,
    `Tipo de equipo: ${tipoEquipo || 'N/D'}`,
    '',
    `RMS: ${result.metrics.rms.toExponential(3)}`,
    `Kurtosis: ${result.metrics.kurtosis.toFixed(3)}`,
    `Factor de cresta: ${result.metrics.crestFactor.toFixed(3)}`,
    `AEA >2kHz: ${result.metrics.aeaPercentage.toFixed(1)}%`,
    `Frecuencia dominante: ${result.metrics.dominantFrequency.toFixed(1)} Hz`,
    `Duración: ${result.metrics.duration.toFixed(2)} s`,
    `Fs: ${result.metrics.sampleRate} Hz`,
    '',
    `PROBABILIDAD DE FALLA: ${result.probabilidad_falla ?? 'N/D'}%`,
    `RUL: ${result.rul ?? 'N/D'}`,
    '',
    `DIAGNÓSTICO:\n${result.diagnostico}`,
    '',
    `PATRÓN DE FALLA:\n${result.patron_falla ?? 'N/D'}`,
    '',
    `FRECUENCIAS CARACTERÍSTICAS:\n${result.frecuencias_caracteristicas ?? 'N/D'}`,
    '',
    `RECOMENDACIONES:\n${result.recomendaciones ?? 'N/D'}`,
  ].join('\n')

  zip.file('resumen.txt', summary)

  const twfCsv =
    'time_s,amplitude\n' +
    result.metrics.twf.times
      .map((t, i) => `${t.toFixed(6)},${result.metrics.twf.amplitudes[i].toFixed(6)}`)
      .join('\n')
  zip.file('twf.csv', twfCsv)

  const fftCsv =
    'freq_hz,magnitude_db\n' +
    result.metrics.fftSpectrum.frequencies
      .map((f, i) => `${f.toFixed(2)},${result.metrics.fftSpectrum.magnitudesDb[i].toFixed(4)}`)
      .join('\n')
  zip.file('fft.csv', fftCsv)

  const peaksCsv =
    'frequency_hz,magnitude_db\n' +
    result.metrics.peakFrequencies.map((p) => `${p.frequency.toFixed(1)},${p.magnitudeDb.toFixed(1)}`).join('\n')
  zip.file('peaks.csv', peaksCsv)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sonomat_${result.tag}_${new Date(result.fecha).toISOString().slice(0, 10)}.zip`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SonomatResult({ result, tipoEquipo }: SonomatResultProps) {
  const [exporting, setExporting] = useState<'docx' | 'zip' | null>(null)

  const probFalla = result.probabilidad_falla ?? 0

  async function handleExport(type: 'docx' | 'zip') {
    setExporting(type)
    try {
      if (type === 'docx') await exportDocx(result, tipoEquipo)
      else await exportZip(result, tipoEquipo)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Diagnóstico KIRA
          </p>
          <p className="text-base font-semibold text-slate-100 mt-0.5">{result.tag}</p>
          <p className="text-xs text-slate-500">
            {new Date(result.fecha).toLocaleString('es-AR')} · {result.inspector_name}
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('zip')}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            {exporting === 'zip' ? 'Exportando…' : 'ZIP'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-700 border border-sky-600 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {exporting === 'docx' ? 'Exportando…' : 'Informe DOCX'}
          </button>
        </div>
      </div>

      {/* Gauge + RUL */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5">
          <ProbabilityGauge value={probFalla} />
        </div>
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <Clock className="w-6 h-6 text-violet-400 mb-2" />
          <p className="text-2xl font-mono font-bold text-violet-300">{result.rul ?? '—'}</p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            Vida útil remanente (RUL)
          </p>
        </div>
      </div>

      {/* Diagnostic sections */}
      <Section icon={AlertTriangle} title="Diagnóstico" content={result.diagnostico} accent="sky" />

      {result.patron_falla && (
        <Section icon={Activity} title="Patrón de falla" content={result.patron_falla} accent="amber" />
      )}

      {result.frecuencias_caracteristicas && (
        <Section icon={Zap} title="Frecuencias características" content={result.frecuencias_caracteristicas} accent="violet" />
      )}

      {result.recomendaciones && (
        <Section icon={CheckCircle} title="Recomendaciones" content={result.recomendaciones} accent="emerald" />
      )}

      {/* Norms footer */}
      <p className="text-[10px] text-slate-600 text-center">
        Análisis conforme ISO 10816 · ISO 13373 · ISO 18436-2
      </p>
    </div>
  )
}
