import type { WorkOrder } from './types'

// ── ISO 8601 week number ────────────────────────────────────────────────────

export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}

export function isoWeekLabel(week: number, year: number): string {
  return `S${String(week).padStart(2, '0')}-${year}`
}

export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// ── UUID ────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `ot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ── XLSX smart column detection ─────────────────────────────────────────────

type ColKey = 'otNumber' | 'description' | 'date' | 'hhProg' | 'observations'

const COL_PATTERNS: Record<ColKey, RegExp> = {
  otNumber:    /orden|order|ot\b|número|numero|no\.?|n°/i,
  description: /descrip|texto|text|tarea|work|actividad|activity/i,
  date:        /fecha|date|program|ejecuci/i,
  hhProg:      /hh\s*prog|hora.*prog|prog.*hora|planned.*hour|hour.*plan|horas/i,
  observations:/obs|nota|comment|remark|hallazgo/i,
}

export function detectColumns(headers: string[]): Partial<Record<ColKey, number>> {
  const map: Partial<Record<ColKey, number>> = {}
  headers.forEach((h, i) => {
    for (const [key, pattern] of Object.entries(COL_PATTERNS) as [ColKey, RegExp][]) {
      if (!map[key] && pattern.test(h)) {
        map[key] = i
      }
    }
  })
  return map
}

function parseDate(raw: unknown): string {
  if (!raw) return dateToISO(new Date())
  // Excel serial number
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000))
    return dateToISO(d)
  }
  const str = String(raw).trim()
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmy) {
    const y = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]
    return `${y}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? dateToISO(new Date()) : dateToISO(parsed)
}

function parseHours(raw: unknown): number {
  if (raw == null || raw === '') return 0
  const n = parseFloat(String(raw).replace(',', '.'))
  return isNaN(n) ? 0 : Math.max(0, n)
}

export function rowsToWorkOrders(
  rows: unknown[][],
  headers: string[],
  colMap: Partial<Record<ColKey, number>>,
): WorkOrder[] {
  return rows
    .filter((r) => r.some((c) => c != null && c !== ''))
    .map((row) => {
      const dateStr = colMap.date != null ? parseDate(row[colMap.date]) : dateToISO(new Date())
      const { week, year } = getISOWeek(new Date(dateStr))
      const otRaw = colMap.otNumber != null ? String(row[colMap.otNumber] ?? '').trim() : ''
      return {
        id: generateId(),
        otNumber: otRaw.slice(0, 8).padStart(otRaw.length > 0 ? otRaw.length : 1, '0'),
        description: colMap.description != null ? String(row[colMap.description] ?? '').trim() : '',
        date: dateStr,
        isoWeek: week,
        isoYear: year,
        hhProg: colMap.hhProg != null ? parseHours(row[colMap.hhProg]) : 0,
        hhr: 0,
        status: 'en_proceso' as const,
        observations: colMap.observations != null ? String(row[colMap.observations] ?? '').trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })
    .filter((o) => o.otNumber || o.description)
}
