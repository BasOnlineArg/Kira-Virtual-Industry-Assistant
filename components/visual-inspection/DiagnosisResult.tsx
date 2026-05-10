'use client'

import { FileDown, AlertTriangle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnalysisResult {
  id: string | null
  tag: string
  diagnostico: string
  severidad: string
  base_metodologica: string
  recomendaciones: string
  foto_url: string | null
  fecha: string
  inspector_name: string
  observation?: string
}

// ─── Severity config ──────────────────────────────────────────────────────────

const severityConfig = {
  ALTA: {
    label: 'ALTA',
    icon: AlertTriangle,
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    border: 'border-red-500/30',
    header: 'bg-red-500/5',
    dot: 'bg-red-400',
  },
  MEDIA: {
    label: 'MEDIA',
    icon: AlertCircle,
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/30',
    header: 'bg-amber-500/5',
    dot: 'bg-amber-400',
  },
  BAJA: {
    label: 'BAJA',
    icon: CheckCircle,
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/30',
    header: 'bg-emerald-500/5',
    dot: 'bg-emerald-400',
  },
}

// ─── DOCX export ──────────────────────────────────────────────────────────────

async function exportDocx(data: AnalysisResult) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, BorderStyle } =
    await import('docx')

  const fecha = new Date(data.fecha).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  function section(title: string, content: string) {
    return [
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 24, color: '0EA5E9' })],
        spacing: { before: 300, after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '334155' } },
      }),
      new Paragraph({
        children: [new TextRun({ text: content, size: 22 })],
        spacing: { before: 100, after: 200 },
      }),
    ]
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '1E293B' },
        },
      },
    },
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({ text: 'KIRA — Reporte de Inspección Visual', bold: true, size: 36, color: '0F172A' }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Metadata
          new Paragraph({
            children: [new TextRun({ text: `Activo (TAG): `, bold: true, size: 22 }), new TextRun({ text: data.tag, size: 22 })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Fecha: `, bold: true, size: 22 }), new TextRun({ text: fecha, size: 22 })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Inspector: `, bold: true, size: 22 }), new TextRun({ text: data.inspector_name, size: 22 })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Severidad: `, bold: true, size: 22 }),
              new TextRun({ text: data.severidad, bold: true, size: 22, color: data.severidad === 'ALTA' ? 'EF4444' : data.severidad === 'MEDIA' ? 'F59E0B' : '10B981' }),
            ],
            spacing: { after: 300 },
          }),

          // Sections
          ...section('DIAGNÓSTICO', data.diagnostico),
          ...section('BASE METODOLÓGICA', data.base_metodologica),
          ...section('RECOMENDACIONES DE CAMPO', data.recomendaciones),

          // Observation
          ...(data.observation
            ? section('OBSERVACIÓN DEL INSPECTOR', data.observation)
            : []),

          // Footer
          new Paragraph({
            children: [
              new TextRun({ text: `Generado por KIRA v0.1 · ${fecha} · Operación Minera Patagonia`, size: 18, color: '94A3B8' }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `KIRA-Visual-${data.tag}-${new Date(data.fecha).toISOString().slice(0, 10)}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DiagnosisResultProps {
  result: AnalysisResult
  observation?: string
}

export default function DiagnosisResult({ result, observation }: DiagnosisResultProps) {
  const sev = severityConfig[result.severidad as keyof typeof severityConfig] ?? severityConfig.MEDIA
  const SevIcon = sev.icon

  const fecha = new Date(result.fecha).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  async function handleExport() {
    await exportDocx({ ...result, observation })
  }

  return (
    <div className={cn('kira-card overflow-hidden border', sev.border)}>
      {/* Header */}
      <div className={cn('px-5 py-4 border-b border-slate-700/40 flex items-center justify-between', sev.header)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-2 h-2 rounded-full', sev.dot)} />
          <div>
            <p className="text-xs text-slate-500">TAG: <span className="text-slate-300 font-medium">{result.tag}</span></p>
            <p className="text-[10px] text-slate-600">{fecha} · {result.inspector_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('kira-badge border text-xs font-semibold flex items-center gap-1.5', sev.badge)}>
            <SevIcon className="w-3.5 h-3.5" />
            Severidad {sev.label}
          </span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400
                       hover:text-slate-200 border border-slate-700 hover:border-slate-500
                       rounded-lg transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            Exportar DOCX
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        <Section title="Diagnóstico" content={result.diagnostico} />
        <Section title="Base Metodológica" content={result.base_metodologica} />
        <Section title="Recomendaciones de Campo" content={result.recomendaciones} />
        {observation && (
          <Section title="Observación del Inspector" content={observation} muted />
        )}
      </div>
    </div>
  )
}

function Section({ title, content, muted }: { title: string; content: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">{title}</p>
      <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', muted ? 'text-slate-500' : 'text-slate-300')}>
        {content}
      </p>
    </div>
  )
}
