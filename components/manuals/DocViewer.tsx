'use client'

import { useState, useEffect } from 'react'
import { Printer, ExternalLink, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Manual } from '@/lib/manuals/types'

interface Props {
  manual: Manual
}

export default function DocViewer({ manual }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [txtContent, setTxtContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSignedUrl(null)
    setTxtContent(null)
    setLoading(true)

    async function load() {
      const supabase = createClient()

      if (manual.formato === 'txt') {
        // Download and display text
        const { data } = await supabase.storage
          .from('manuals')
          .download(manual.storagePath)
        if (data) setTxtContent(await data.text())
      } else {
        // Get signed URL (valid 1 hour)
        const { data } = await supabase.storage
          .from('manuals')
          .createSignedUrl(manual.storagePath, 3600)
        if (data) setSignedUrl(data.signedUrl)
      }
      setLoading(false)
    }

    load()
  }, [manual.id, manual.formato, manual.storagePath])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Cargando documento…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 shrink-0">
        <FileText className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-400 flex-1 truncate">{manual.nombre}</span>
        {signedUrl && (
          <>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700
                         text-[11px] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Printer className="w-3 h-3" /> Imprimir
            </button>
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700
                         text-[11px] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Abrir
            </a>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {manual.formato === 'pdf' && signedUrl && (
          <iframe
            src={signedUrl}
            className="w-full h-full border-0 bg-white"
            title={manual.nombre}
          />
        )}

        {manual.formato === 'imagen' && signedUrl && (
          <div className="h-full overflow-auto flex items-start justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signedUrl}
              alt={manual.nombre}
              className="max-w-full rounded-lg shadow-xl"
            />
          </div>
        )}

        {manual.formato === 'txt' && txtContent !== null && (
          <div className="h-full overflow-auto p-6">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {txtContent}
            </pre>
          </div>
        )}

        {!signedUrl && txtContent === null && (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            No se pudo cargar el documento.
          </div>
        )}
      </div>
    </div>
  )
}
