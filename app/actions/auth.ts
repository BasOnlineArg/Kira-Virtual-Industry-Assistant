'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos.' }
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: 'Credenciales inválidas. Verificá tu email y contraseña.' }
  }

  // Whitelist check: user must exist in the public.users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, role, active')
    .eq('id', authData.user.id)
    .single()

  if (userError || !userData) {
    await supabase.auth.signOut()
    return { error: 'Usuario no autorizado. Contactá al administrador.' }
  }

  if (!userData.active) {
    await supabase.auth.signOut()
    return { error: 'Tu cuenta está desactivada. Contactá al administrador.' }
  }

  redirect('/')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
