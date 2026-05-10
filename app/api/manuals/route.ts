import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ── GET: list all manuals ─────────────────────────────────────────────────────
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('manuals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbToClient))
}

// ── POST: register a manual after client-side Storage upload ──────────────────
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: {
    nombre: string
    tipoActivo: string
    fabricante: string
    tipoDoc: string
    formato: string
    storagePath: string
    tamanoBytes: number
  }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Build public URL for the file
  const { data: urlData } = admin.storage.from('manuals').getPublicUrl(body.storagePath)

  const { data, error } = await admin
    .from('manuals')
    .insert({
      nombre:       body.nombre,
      tipo_activo:  body.tipoActivo,
      fabricante:   body.fabricante,
      tipo_doc:     body.tipoDoc,
      formato:      body.formato,
      storage_path: body.storagePath,
      url:          urlData.publicUrl,
      tamano_bytes: body.tamanoBytes,
      procesado:    false,
      chunk_count:  0,
      uploaded_by:  user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(dbToClient(data))
}

// ── DELETE: remove manual + storage file + chunks (cascade) ──────────────────
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get storage path before deleting
  const { data: manual } = await admin
    .from('manuals').select('storage_path').eq('id', body.id).single()

  if (manual?.storage_path) {
    await admin.storage.from('manuals').remove([manual.storage_path])
  }

  // DB delete cascades to manual_chunks
  const { error } = await admin.from('manuals').delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ── Mapper ────────────────────────────────────────────────────────────────────
function dbToClient(row: Record<string, unknown>) {
  return {
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
  }
}
