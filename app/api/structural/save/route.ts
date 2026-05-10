import { NextRequest, NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { riskScore, riskLevel } from '@/lib/structural/constants'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users').select('id, name').eq('id', user.id).single()

  let body: {
    tag:                string
    sector:             string
    tipoInspeccion:     string
    estadoGlobal:       string
    otSap?:             string
    criticidad:         number
    frecuencia:         number
    impacto:            number
    findings?:          string
    observaciones?:     string
    herramientasNdt:    string[]
    frmRisks:           string[]
    photos:             string[]   // base64 data URLs
    checklistPdfUrl?:   string    // ya subido al Storage desde el cliente
    diagnostico:        string
    recomendaciones?:   string
  }

  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Payload inválido' }, { status: 400 }) }

  const {
    tag, sector, tipoInspeccion, estadoGlobal, otSap,
    criticidad, frecuencia, impacto,
    findings, observaciones,
    herramientasNdt, frmRisks,
    photos, checklistPdfUrl,
    diagnostico, recomendaciones,
  } = body

  if (!tag || !sector) {
    return NextResponse.json({ error: 'TAG y sector son requeridos' }, { status: 400 })
  }

  const risk    = (criticidad && frecuencia && impacto) ? riskScore(criticidad, frecuencia, impacto) : 0
  const riskLvl = riskLevel(risk)
  const admin   = createAdminClient()

  // Upload field photos (base64) to storage
  const uploadedPhotoUrls: string[] = []
  for (const dataUrl of photos ?? []) {
    try {
      const base64 = dataUrl.split(',')[1]
      if (!base64) continue
      const buffer = Buffer.from(base64, 'base64')
      const ext    = dataUrl.startsWith('data:image/png') ? 'png' : dataUrl.startsWith('data:image/webp') ? 'webp' : 'jpg'
      const path   = `photos/${Date.now()}_${tag.replace(/[^a-z0-9]/gi, '_')}_${uploadedPhotoUrls.length}.${ext}`

      const { error: uploadErr } = await admin.storage
        .from('inspection-photos')
        .upload(path, buffer, {
          contentType: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg',
          upsert: false,
        })

      if (!uploadErr) {
        const { data: urlData } = admin.storage.from('inspection-photos').getPublicUrl(path)
        uploadedPhotoUrls.push(urlData.publicUrl)
      }
    } catch { /* skip failed uploads */ }
  }

  // Determine estado from risk + estadoGlobal
  const estado = estadoGlobal === 'critico' || riskLvl.label === 'Crítico'
    ? 'rechazada'
    : estadoGlobal === 'malo' || riskLvl.label === 'Alto'
    ? 'observada'
    : 'aprobada'

  const { data: savedInsp, error: saveErr } = await admin
    .from('inspections')
    .insert({
      asset_tag:          tag,
      inspector_id:       userData?.id ?? user.id,
      fecha:              new Date().toISOString(),
      tipo:               tipoInspeccion || 'rutina',
      sector,
      tipo_inspeccion:    tipoInspeccion || null,
      estado_global:      estadoGlobal  || null,
      ot_sap:             otSap         || null,
      estado,
      criticidad:         criticidad    || null,
      frecuencia:         frecuencia    || null,
      impacto:            impacto       || null,
      risk_score:         risk          || null,
      findings:           findings      || null,
      herramientas_ndt:   herramientasNdt.length > 0 ? JSON.stringify(herramientasNdt) : null,
      frm_risks:          frmRisks.length      > 0 ? JSON.stringify(frmRisks)      : null,
      photos:             uploadedPhotoUrls.length > 0 ? JSON.stringify(uploadedPhotoUrls) : null,
      checklist_pdf_url:  checklistPdfUrl || null,
      diagnostico:        diagnostico    || null,
      recomendaciones:    recomendaciones || null,
      notas:              observaciones  || null,
    })
    .select()
    .single()

  if (saveErr) return NextResponse.json({ error: saveErr.message }, { status: 500 })

  return NextResponse.json({
    id:              savedInsp.id,
    tag,
    sector,
    tipoInspeccion,
    estadoGlobal,
    otSap,
    estado,
    risk_score:      risk,
    risk_label:      riskLvl.label,
    herramientasNdt,
    frmRisks,
    photos:          uploadedPhotoUrls,
    checklistPdfUrl: checklistPdfUrl || null,
    diagnostico,
    recomendaciones: recomendaciones || null,
    fecha:           savedInsp.fecha,
    inspector_name:  userData?.name ?? 'Inspector',
  })
}
