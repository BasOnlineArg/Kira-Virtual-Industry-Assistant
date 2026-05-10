'use client'

import { useState, useCallback } from 'react'
import { MessageSquare, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import ManualLibraryPanel from './ManualLibraryPanel'
import ChatPanel from './ChatPanel'
import DocViewer from './DocViewer'
import type { Manual, ChatSession } from '@/lib/manuals/types'

interface Props {
  initialManuals:  Manual[]
  initialSessions: ChatSession[]
}

type ActiveTab = 'chat' | 'viewer'

export default function ManualsClient({ initialManuals, initialSessions }: Props) {
  const [manuals,     setManuals]     = useState<Manual[]>(initialManuals)
  const [selectedDoc, setSelectedDoc] = useState<Manual | null>(null)
  const [activeTab,   setActiveTab]   = useState<ActiveTab>('chat')

  const handleSelectDoc = useCallback((m: Manual) => {
    setSelectedDoc(m)
    setActiveTab('viewer')
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setManuals((prev) => prev.filter((m) => m.id !== id))
    if (selectedDoc?.id === id) setSelectedDoc(null)
    try {
      await fetch('/api/manuals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (e) {
      console.error('[Manuals] delete error', e)
    }
  }, [selectedDoc])

  const handleNewManual = useCallback((m: Manual) => {
    setManuals((prev) => [m, ...prev])
    // Poll for processed state
    if (!m.procesado) {
      const interval = setInterval(async () => {
        const res = await fetch('/api/manuals')
        if (!res.ok) { clearInterval(interval); return }
        const all = await res.json() as Manual[]
        const updated = all.find((x) => x.id === m.id)
        if (updated?.procesado) {
          setManuals((prev) => prev.map((x) => x.id === m.id ? updated : x))
          clearInterval(interval)
        }
      }, 4000)
      // Stop polling after 3 minutes
      setTimeout(() => clearInterval(interval), 180_000)
    }
  }, [])

  return (
    <div className="flex gap-4 h-full min-h-0">

      {/* ── LEFT: Library panel ─────────────────────────────────────────── */}
      <div className="w-64 xl:w-72 shrink-0 overflow-hidden flex flex-col">
        <ManualLibraryPanel
          manuals={manuals}
          selectedId={selectedDoc?.id ?? null}
          onSelect={handleSelectDoc}
          onDelete={handleDelete}
          onNewManual={handleNewManual}
        />
      </div>

      {/* ── RIGHT: Tabbed panel ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-800/20 border border-slate-700/40 rounded-2xl overflow-hidden">

        {/* Tab bar */}
        <div className="flex shrink-0 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 transition-colors',
              activeTab === 'chat'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Consultas IA
          </button>
          <button
            onClick={() => setActiveTab('viewer')}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 transition-colors',
              activeTab === 'viewer'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Visor
            {selectedDoc && (
              <span className="max-w-[120px] truncate text-[10px] opacity-70">{selectedDoc.nombre}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'chat' && (
            <ChatPanel manuals={manuals} initialSessions={initialSessions} />
          )}

          {activeTab === 'viewer' && (
            selectedDoc
              ? <DocViewer manual={selectedDoc} />
              : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                  <BookOpen className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Seleccioná un documento de la biblioteca</p>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  )
}
