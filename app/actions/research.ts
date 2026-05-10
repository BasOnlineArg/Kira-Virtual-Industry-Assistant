'use server'

import { createClient } from '@/lib/supabase/server'
import type { ChatMessage } from '@/lib/types'

export async function createSession() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data, error } = await supabase
    .from('research_sessions')
    .insert({ user_id: user.id, titulo: 'Nueva sesión', messages: [] })
    .select('id, titulo, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function updateSession(
  id: string,
  messages: ChatMessage[],
  titulo?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const payload: Record<string, unknown> = { messages }
  if (titulo !== undefined) payload.titulo = titulo

  const { error } = await supabase
    .from('research_sessions')
    .update(payload)
    .eq('id', id)

  if (error) throw error
}

export async function deleteSession(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function renameSession(id: string, titulo: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('research_sessions')
    .update({ titulo: titulo.trim() || 'Sin título' })
    .eq('id', id)

  if (error) throw error
}
