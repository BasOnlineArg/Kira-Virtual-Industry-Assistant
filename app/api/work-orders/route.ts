import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ─── GET: list all work orders ───────────────────────────────────────────────
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('work_orders')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Map snake_case → camelCase for the client
  const mapped = (data ?? []).map(dbToClient)
  return NextResponse.json(mapped)
}

// ─── POST: create one work order ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Accept both a single order or an array (for XLSX bulk import)
  const rows = Array.isArray(body) ? body : [body]
  const inserts = rows.map(clientToDb)

  const { data, error } = await admin
    .from('work_orders')
    .insert(inserts)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(dbToClient))
}

// ─── PATCH: update a single field or multiple fields ─────────────────────────
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

  const patch = clientToDb(rest)
  patch.updated_at = new Date().toISOString()

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('work_orders')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(dbToClient(data))
}

// ─── DELETE: remove a work order ─────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('work_orders').delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────
function dbToClient(row: Record<string, unknown>) {
  return {
    id:           row.id,
    otNumber:     row.ot_number,
    description:  row.description,
    date:         row.fecha,        // DB: fecha → client: date
    isoWeek:      row.iso_week,
    isoYear:      row.iso_year,
    hhProg:       Number(row.hh_prog),
    hhr:          Number(row.hhr),
    status:       row.status,
    observations: row.observations,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  }
}

function clientToDb(o: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  if (o.id          !== undefined) out.id          = o.id
  if (o.otNumber    !== undefined) out.ot_number   = o.otNumber
  if (o.description !== undefined) out.description = o.description
  if (o.date        !== undefined) out.fecha       = o.date   // client: date → DB: fecha
  if (o.isoWeek     !== undefined) out.iso_week    = o.isoWeek
  if (o.isoYear     !== undefined) out.iso_year    = o.isoYear
  if (o.hhProg      !== undefined) out.hh_prog     = o.hhProg
  if (o.hhr         !== undefined) out.hhr         = o.hhr
  if (o.status      !== undefined) out.status      = o.status
  if (o.observations!== undefined) out.observations= o.observations
  return out
}
