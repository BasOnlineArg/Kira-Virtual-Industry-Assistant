import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  mano_obra:      'Mano de Obra',
  maquina:        'Máquina',
  metodo:         'Método',
  material:       'Material',
  medio_ambiente: 'Medio Ambiente',
  medicion:       'Medición',
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 503 })
  }

  let body: {
    w5h2: {
      what: string; who: string; where: string; when: string
      why: string; how: string; how_much: string
    }
    ishikawa: Record<string, Array<{ id: string; texto: string }>>
    porgues:  Record<string, string[]>
    inspectorNotes: string
  }

  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Payload inválido' }, { status: 400 }) }

  const { w5h2, ishikawa, porgues, inspectorNotes } = body

  // ── Build context text ────────────────────────────────────────────────────
  const ishikawaText = Object.entries(ishikawa)
    .map(([catId, causes]) => {
      if (!causes.length) return ''
      const label = CATEGORY_LABELS[catId] ?? catId
      const causeLines = causes.map((c) => {
        const whys = porgues[c.id] ?? []
        const whyLines = whys
          .filter(Boolean)
          .map((w, i) => `      → Por qué ${i + 1}: ${w}`)
          .join('\n')
        return `    • ${c.texto}${whyLines ? '\n' + whyLines : ''}`
      }).join('\n')
      return `${label}:\n${causeLines}`
    })
    .filter(Boolean)
    .join('\n\n')

  const prompt = `Sos un experto en Análisis de Causa Raíz (RCA) con amplia experiencia en mantenimiento industrial para operaciones mineras en Patagonia, Argentina. Tu análisis debe ser técnico, preciso y accionable.

## EVENTO — 5W2H

**¿Qué ocurrió?** ${w5h2.what}
**¿Quién?** ${w5h2.who}
**¿Dónde?** ${w5h2.where}
**¿Cuándo?** ${w5h2.when}
**¿Cómo?** ${w5h2.how}
${w5h2.why      ? `**Causa aparente inicial:** ${w5h2.why}` : ''}
${w5h2.how_much ? `**Impacto / costo estimado:** ${w5h2.how_much}` : ''}

## ANÁLISIS ISHIKAWA 6M + 5 PORQUÉS

${ishikawaText || 'Sin causas registradas.'}

## PERSPECTIVA DEL INSPECTOR

${inspectorNotes || 'Sin notas adicionales.'}

---

## INSTRUCCIONES DE RESPUESTA

Respondé ÚNICAMENTE con un JSON válido, sin markdown, sin texto adicional, sin bloques de código. El JSON debe tener exactamente esta estructura:

{
  "causaRaiz": "descripción específica y técnica de la causa raíz principal",
  "causasContribuyentes": ["causa 1", "causa 2", "causa 3"],
  "nivelRiesgoResidual": "Crítico",
  "accionesCorrectivas": [
    { "accion": "descripción de la acción", "responsable": "rol o área responsable", "plazo": "plazo concreto" }
  ],
  "leccionesAprendidas": ["lección 1", "lección 2"],
  "patronesMonitorear": ["patrón 1", "patrón 2"],
  "conclusionEjecutiva": "párrafo ejecutivo con diagnóstico y recomendaciones principales",
  "lineaTiempo": [
    { "momento": "etiqueta temporal", "descripcion": "evento clave breve", "tipo": "inicio" }
  ]
}

Reglas:
- causasContribuyentes: mínimo 3, máximo 6
- nivelRiesgoResidual: exactamente uno de "Crítico", "Alto", "Medio" o "Bajo"
- accionesCorrectivas: mínimo 3, cada una con responsable concreto y plazo realista
- leccionesAprendidas: mínimo 2
- patronesMonitorear: mínimo 2
- lineaTiempo: entre 4 y 8 eventos, ordenados cronológicamente, tipo ∈ "inicio"|"escalada"|"critico"|"fin"
- Usá terminología técnica de mantenimiento industrial minero
- El análisis debe ser específico al contexto descripto, no genérico`

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 4096,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    // Strip accidental markdown fences
    const jsonStr = raw
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const result = JSON.parse(jsonStr)
    return NextResponse.json(result)

  } catch (err) {
    console.error('[RCA analyze]', err)
    const msg = err instanceof SyntaxError
      ? 'La IA devolvió una respuesta inesperada. Intentá de nuevo.'
      : 'Error al procesar el análisis. Verificá la API key y el modelo.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
