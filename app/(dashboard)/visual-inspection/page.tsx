import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Camera } from 'lucide-react'
import VisualInspectionClient from '@/components/visual-inspection/VisualInspectionClient'

export const dynamic = 'force-dynamic'

export default async function VisualInspectionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: history } = await admin
    .from('visual_analyses')
    .select(`
      id,
      asset_tag,
      severidad,
      diagnostico,
      foto_url,
      fecha,
      users:inspector_id ( name )
    `)
    .order('fecha', { ascending: false })
    .limit(200)

  const normalizedHistory = (history ?? []).map((item) => ({
    id: item.id,
    asset_tag: item.asset_tag ?? null,
    severidad: item.severidad ?? null,
    diagnostico: item.diagnostico ?? null,
    foto_url: item.foto_url ?? null,
    fecha: item.fecha,
    inspector_name: Array.isArray(item.users)
      ? (item.users[0] as { name: string })?.name
      : (item.users as { name: string } | null)?.name ?? undefined,
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-700/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Camera className="w-5 h-5 text-sky-400" />
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Inspección Visual</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Diagnóstico por visión artificial · Severidad ALTA / MEDIA / BAJA · Export DOCX
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <VisualInspectionClient initialHistory={normalizedHistory} />
      </div>
    </div>
  )
}
