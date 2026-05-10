import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import StructuralClient from '@/components/structural/StructuralClient'
import type { InspectionRow } from '@/components/structural/InspectionHistory'

export const dynamic = 'force-dynamic'

export default async function StructuralInspectionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [{ data: inspData }, { data: reportsData }] = await Promise.all([
    admin
      .from('inspections')
      .select(`
        id, asset_tag, sector, tipo_estructura,
        score_pct, estado, ot_sap, falla_prob,
        diagnostico, fecha, inspector_id
      `)
      .order('fecha', { ascending: false })
      .limit(200),

    admin
      .from('structural_reports')
      .select('id, nombre, tipo, url, asset_tag, descripcion, fecha')
      .order('fecha', { ascending: false })
      .limit(200),
  ])

  const history: InspectionRow[] = (inspData ?? []) as InspectionRow[]
  const reports = reportsData ?? []

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Inspecciones Estructurales</h1>
        <p className="text-sm text-slate-500 mt-1">
          FRM · Riesgo C×F×I · NDT · Fotos · Diagnóstico KIRA · Biblioteca de Informes
        </p>
      </div>
      <StructuralClient initialHistory={history} initialReports={reports} />
    </div>
  )
}
