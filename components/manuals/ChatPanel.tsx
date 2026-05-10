'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Plus, ChevronDown, ChevronUp, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatSession, ChatMessage, Manual, ChunkCitation } from '@/lib/manuals/types'

interface Props {
  manuals:         Manual[]
  initialSessions: ChatSession[]
}

export default function ChatPanel({ manuals, initialSessions }: Props) {
  const [sessions,    setSessions]    = useState<ChatSession[]>(initialSessions)
  const [activeId,    setActiveId]    = useState<string | null>(initialSessions[0]?.id ?? null)
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [query,       setQuery]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [filterIds,   setFilterIds]   = useState<string[]>([])  // empty = all manuals
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load messages when active session changes
  useEffect(() => {
    if (!activeId) return
    setLoadingMsgs(true)
    fetch(`/api/manuals/messages?sessionId=${activeId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data.map(dbMsgToClient) : [])
      })
      .finally(() => setLoadingMsgs(false))
  }, [activeId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const createSession = useCallback(async () => {
    const res = await fetch('/api/manuals/sessions', { method: 'POST' })
    if (!res.ok) return
    const session = await res.json() as ChatSession
    setSessions((prev) => [session, ...prev])
    setActiveId(session.id)
    setMessages([])
  }, [])

  // Auto-create session if none
  useEffect(() => {
    if (initialSessions.length === 0) createSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend() {
    if (!query.trim() || !activeId || loading) return
    const text = query.trim()
    setQuery('')
    setLoading(true)

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `tmp-${Date.now()}`, sessionId: activeId, role: 'user',
      content: text, createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res = await fetch('/api/manuals/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeId,
          query:     text,
          manualIds: filterIds.length > 0 ? filterIds : undefined,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { message } = await res.json()
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        tempUserMsg,
        dbMsgToClient(message),
      ])

      // Update session title if it changed
      setSessions((prev) => prev.map((s) =>
        s.id === activeId ? { ...s, updatedAt: new Date().toISOString() } : s
      ))
    } catch (e) {
      console.error('[Chat]', e)
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const processedManuals = manuals.filter((m) => m.procesado)

  return (
    <div className="flex flex-col h-full">

      {/* Session selector + new button */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 shrink-0">
        <select
          className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-1.5
                     text-[11px] text-slate-300 focus:outline-none focus:border-violet-500/50"
          value={activeId ?? ''}
          onChange={(e) => setActiveId(e.target.value)}
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.titulo}</option>
          ))}
        </select>
        <button
          onClick={createSession}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700
                     text-[11px] text-slate-400 hover:text-white hover:border-violet-500/50 transition-colors"
        >
          <Plus className="w-3 h-3" /> Nueva
        </button>
      </div>

      {/* Manual filter chips */}
      {processedManuals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-slate-700/30 shrink-0">
          <span className="text-[9px] text-slate-600 self-center">Buscar en:</span>
          <button
            onClick={() => setFilterIds([])}
            className={cn(
              'px-2 py-0.5 rounded-full border text-[10px] transition-colors',
              filterIds.length === 0
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                : 'border-slate-700/50 text-slate-500 hover:text-slate-300',
            )}
          >
            Todos los manuales
          </button>
          {processedManuals.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterIds((prev) =>
                prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
              )}
              className={cn(
                'px-2 py-0.5 rounded-full border text-[10px] transition-colors truncate max-w-[140px]',
                filterIds.includes(m.id)
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                  : 'border-slate-700/50 text-slate-500 hover:text-slate-300',
              )}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMsgs ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
            <Bot className="w-8 h-8 opacity-30" />
            <p className="text-sm">Hacé una pregunta técnica</p>
            <p className="text-xs">KIRA buscará en los manuales cargados</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} manuals={manuals} />
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="bg-slate-800/60 rounded-xl rounded-tl-none px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4">
        {processedManuals.length === 0 && (
          <p className="text-[11px] text-amber-400/80 mb-2 text-center">
            Cargá al menos un manual para poder consultar.
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            placeholder="Preguntá sobre torques, intervalos de mantenimiento, especificaciones OEM…"
            disabled={loading || processedManuals.length === 0}
            className="flex-1 kira-input resize-none text-xs py-2.5 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={loading || !query.trim() || processedManuals.length === 0}
            className="self-end px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
                       text-white transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-slate-600 mt-1.5 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, manuals }: { message: ChatMessage; manuals: Manual[] }) {
  const [showCitations, setShowCitations] = useState(false)
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 items-start', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border',
        isUser
          ? 'bg-slate-700/60 border-slate-600'
          : 'bg-violet-500/20 border-violet-500/30',
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-slate-400" />
          : <Bot className="w-3.5 h-3.5 text-violet-400" />
        }
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] space-y-1.5', isUser && 'items-end')}>
        <div className={cn(
          'px-4 py-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-slate-700/60 text-slate-200 rounded-tr-none'
            : 'bg-slate-800/60 text-slate-200 rounded-tl-none border border-slate-700/40',
        )}>
          {message.content}
        </div>

        {/* Citations */}
        {!isUser && message.chunksUsed && message.chunksUsed.length > 0 && (
          <div>
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1 text-[10px] text-violet-400/70 hover:text-violet-400 transition-colors"
            >
              {showCitations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {message.chunksUsed.length} fragmento{message.chunksUsed.length !== 1 ? 's' : ''} consultado{message.chunksUsed.length !== 1 ? 's' : ''}
            </button>

            {showCitations && (
              <div className="mt-1 space-y-1">
                {message.chunksUsed.map((c, i) => (
                  <CitationChip key={i} citation={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CitationChip({ citation }: { citation: ChunkCitation }) {
  // FTS rank is normalized 0–1; label it qualitatively
  const rankVal  = (citation as unknown as Record<string, number>).rank ?? 0
  const rankLabel = rankVal > 0.3 ? 'alta' : rankVal > 0.1 ? 'media' : 'relevante'

  return (
    <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-300 truncate">{citation.manualNombre}</p>
        {citation.sectionPath && (
          <p className="text-[9px] text-slate-500 truncate">{citation.sectionPath}</p>
        )}
      </div>
      <span className="text-[9px] text-violet-400/70 shrink-0">
        {rankLabel}
      </span>
    </div>
  )
}

// ── DB → client mapper ────────────────────────────────────────────────────────
function dbMsgToClient(row: Record<string, unknown>): ChatMessage {
  return {
    id:         row.id as string,
    sessionId:  row.session_id as string,
    role:       row.role as 'user' | 'assistant',
    content:    row.content as string,
    chunksUsed: row.chunks_used as ChunkCitation[] | undefined,
    createdAt:  row.created_at as string,
  }
}
