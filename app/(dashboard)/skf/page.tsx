import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SkfClient from '@/components/skf/SkfClient'
import type { SkfMeasurementRow } from '@/components/skf/SkfHistory'

export const dynamic = 'force-dynamic'

export default async function SkfPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data } = await admin
    .from('skf_measurements')
    .select(`
      id, asset_tag, tipo_equipo, punto_medicion,
      velocity_rms, envelope_ge, temperatura,
      iso_class, estado, falla_prob, rul, diagnostico,
      fecha, inspector_id
    `)
    .order('fecha', { ascending: false })
    .limit(200)

  const history: SkfMeasurementRow[] = (data ?? []) as SkfMeasurementRow[]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-100">SKF QuickCollect</h1>
        <p className="text-sm text-slate-500 mt-1">
          Velocidad RMS · Envolvente gE · Temperatura · ISO 10816 · Diagnóstico KIRA
        </p>
      </div>
      <SkfClient initialHistory={history} />
    </div>
  )
}
