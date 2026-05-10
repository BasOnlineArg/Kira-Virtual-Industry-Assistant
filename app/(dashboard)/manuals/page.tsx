import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ManualsClient from '@/components/manuals/ManualsClient'
import type { Manual, ChatSession } from '@/lib/manuals/types'

export const dynamic = 'force-dynamic'

export default async function ManualsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch manuals and sessions in parallel
  const [{ data: manualsData }, { data: sessionsData }] = await Promise.all([
    admin.from('manuals').select('*').order('created_at', { ascending: false }).limit(200),
    admin.from('manual_chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20),
  ])

  const initialManuals: Manual[] = (manualsData ?? []).map((row) => ({
    id:          row.id,
    nombre:      row.nombre,
    tipoActivo:  row.tipo_activo,
    fabricante:  row.fabricante,
    tipoDoc:     row.tipo_doc,
    formato:     row.formato,
    storagePath: row.storage_path,
    url:         row.url,
    tamanoBytes: row.tamano_bytes,
    procesado:   row.procesado,
    chunkCount:  row.chunk_count,
    uploadedBy:  row.uploaded_by,
    createdAt:   row.created_at,
  }))

  const initialSessions: ChatSession[] = (sessionsData ?? []).map((row) => ({
    id:        row.id,
    userId:    row.user_id,
    titulo:    row.titulo,
    manualIds: row.manual_ids ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 mb-5">
        <h1 className="text-2xl font-bold text-slate-100">
          Biblioteca de Manuales
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          RAG con Contextual Retrieval · PDF · Imágenes · Pautas de mantenimiento
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ManualsClient
          initialManuals={initialManuals}
          initialSessions={initialSessions}
        />
      </div>
    </div>
  )
}
