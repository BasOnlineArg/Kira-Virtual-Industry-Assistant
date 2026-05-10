import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ─── GET: list all avisos ─────────────────────────────────────────────────────
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('avisos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbToClient))
}

// ─── POST: create one aviso ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('avisos')
    .insert(clientToDb(body))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(dbToClient(data))
}

// ─── PATCH: update an aviso (generado_sap toggle, etc.) ──────────────────────
export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { id: string } & Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('avisos')
    .update(clientToDb(rest))
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(dbToClient(data))
}

// ─── DELETE: remove an aviso ──────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('avisos').delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────
function dbToClient(row: Record<string, unknown>) {
  return {
    id:          row.id,
    fecha:       row.fecha,
    isoWeek:     row.iso_week,
    isoYear:     row.iso_year,
    prioridad:   row.prioridad,
    tag:         row.tag,
    ejecutante:row.ejecutante,
    descripcion: row.descripcion,
    generadoSAP: row.generado_sap,
    createdAt:   row.created_at,
  }
}

function clientToDb(o: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  if (o.id          !== undefined) out.id          = o.id
  if (o.fecha       !== undefined) out.fecha       = o.fecha
  if (o.isoWeek     !== undefined) out.iso_week    = o.isoWeek
  if (o.isoYear     !== undefined) out.iso_year    = o.isoYear
  if (o.prioridad   !== undefined) out.prioridad   = o.prioridad
  if (o.tag         !== undefined) out.tag         = o.tag
  if (o.ejecutante!== undefined) out.ejecutante= o.ejecutante
  if (o.descripcion !== undefined) out.descripcion = o.descripcion
  if (o.generadoSAP !== undefined) out.generado_sap= o.generadoSAP
  return out
}
