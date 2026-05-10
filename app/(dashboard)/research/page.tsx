import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResearchClient from '@/components/research/ResearchClient'

export default async function ResearchPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('research_sessions')
    .select('id, titulo, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return <ResearchClient initialSessions={sessions ?? []} />
}
