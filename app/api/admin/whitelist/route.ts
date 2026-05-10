import { NextRequest, NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit }          from '@/lib/admin/audit'

async function getCallerOrDeny() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('users').select('id, email, role').eq('id', user.id).single()
  if (!data || data.role !== 'superusuario') return null
  return data
}

// ── GET /api/admin/whitelist ─────────────────────────────────────────────────
export async function GET() {
  const caller = await getCallerOrDeny()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('whitelist')
    .select('id, email, role_default, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ── POST /api/admin/whitelist ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const caller = await getCallerOrDeny()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, role_default = 'inspector' } = await req.json()
  if (!email) return NextResponse.json({ error: 'email requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('whitelist')
    .insert({ email: email.toLowerCase().trim(), role_default, created_by: caller.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({
    userId:    caller.id,
    userEmail: caller.email,
    action:    'WHITELIST_ADD',
    module:    'admin.whitelist',
    entityId:  data.id,
    metadata:  { email, role_default },
  })

  return NextResponse.json(data, { status: 201 })
}

// ── DELETE /api/admin/whitelist ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const caller = await getCallerOrDeny()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, email } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('whitelist').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({
    userId:    caller.id,
    userEmail: caller.email,
    action:    'WHITELIST_REMOVE',
    module:    'admin.whitelist',
    entityId:  id,
    metadata:  { email },
  })

  return NextResponse.json({ ok: true })
}
