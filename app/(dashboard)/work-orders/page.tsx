import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import WorkOrdersClient from '@/components/work-orders/WorkOrdersClient'
import type { WorkOrder } from '@/lib/work-orders/types'

export const dynamic = 'force-dynamic'

export default async function WorkOrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Server-side initial fetch
  const admin = createAdminClient()
  const { data } = await admin
    .from('work_orders')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(500)

  const initialOrders: WorkOrder[] = (data ?? []).map((row) => ({
    id:           row.id,
    otNumber:     row.ot_number,
    description:  row.description,
    date:         row.fecha,
    isoWeek:      row.iso_week,
    isoYear:      row.iso_year,
    hhProg:       Number(row.hh_prog),
    hhr:          Number(row.hhr),
    status:       row.status,
    observations: row.observations,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 mb-5">
        <h1 className="text-2xl font-bold text-slate-100">Órdenes de Trabajo</h1>
        <p className="text-sm text-slate-500 mt-1">
          HH Programadas vs. HHR · Importación XLSX · Edición inline · Supabase
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <WorkOrdersClient initialOrders={initialOrders} />
      </div>
    </div>
  )
}
