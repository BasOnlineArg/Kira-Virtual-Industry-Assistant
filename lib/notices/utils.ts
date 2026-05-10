export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}

export function isoWeekLabel(week: number, year: number): string {
  return `S${String(week).padStart(2, '0')}-${year}`
}

export function generateId(): string {
  return `av_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
