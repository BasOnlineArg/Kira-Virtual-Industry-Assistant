import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Registra una acción en el audit log.
 * Usar desde API routes server-side únicamente.
 */
export async function logAudit({
  userId,
  userEmail,
  action,
  module,
  entityId,
  metadata,
}: {
  userId:    string
  userEmail: string
  action:    string
  module:    string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const admin = createAdminClient()
    await admin.from('audit_logs').insert({
      user_id:    userId,
      user_email: userEmail,
      action,
      module,
      entity_id:  entityId ?? null,
      metadata:   metadata ?? null,
    })
  } catch (e) {
    // No bloquear la operación principal si el log falla
    console.error('[audit] Error registrando log:', e)
  }
}
