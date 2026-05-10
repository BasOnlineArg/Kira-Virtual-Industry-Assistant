import { NextRequest, NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type Table =
  | 'categorias'
  | 'tipos_activo'
  | 'rutas_inspeccion'
  | 'equipos_trabajo'
  | 'repuestos'

const ALLOWED_TABLES: Table[] = [
  'categorias', 'tipos_activo', 'rutas_inspeccion', 'equipos_trabajo', 'repuestos',
]

function isAllowed(t: string): t is Table {
  return ALLOWED_TABLES.includes(t as Table)
}

async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET /api/auxiliares?tabla=categorias
export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const tabla = req.nextUrl.searchParams.get('tabla') ?? ''
  if (!isAllowed(tabla)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from(tabla)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/auxiliares?tabla=categorias
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const tabla = req.nextUrl.searchParams.get('tabla') ?? ''
  if (!isAllowed(tabla)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 })

  const body = await req.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from(tabla).insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/auxiliares?tabla=categorias
export async function PATCH(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const tabla = req.nextUrl.searchParams.get('tabla') ?? ''
  if (!isAllowed(tabla)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 })

  const { id, ...rest } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.from(tabla).update(rest).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/auxiliares?tabla=categorias
export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const tabla = req.nextUrl.searchParams.get('tabla') ?? ''
  if (!isAllowed(tabla)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from(tabla).delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
