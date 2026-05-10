export type Prioridad  = 'MN' | 'MI' | 'BKL' | 'PP'
export type Ejecutante =
  | 'equipos_fijos'
  | 'electricos_ug'
  | 'dek'
  | 'soldadura'
  | 'dek_portones'
  | 'dek_hvac'
  | 'inspectores'

export interface Aviso {
  id: string
  fecha: string       // YYYY-MM-DD
  isoWeek: number
  isoYear: number
  prioridad:  Prioridad
  tag:        string
  ejecutante: Ejecutante
  descripcion: string
  generadoSAP: boolean
  createdAt:  string
}

export const PRIORIDAD_CONFIG: Record<Prioridad, {
  label: string
  sublabel: string
  color: string
  bg: string
  border: string
  pulse: boolean
}> = {
  MI:  {
    label: 'MI',
    sublabel: 'Urgente / Crítico',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    pulse: true,
  },
  MN:  {
    label: 'MN',
    sublabel: 'Programa siguiente',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    pulse: false,
  },
  PP:  {
    label: 'PP',
    sublabel: 'Parada de planta',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    pulse: false,
  },
  BKL: {
    label: 'BKL',
    sublabel: 'Backlog',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    pulse: false,
  },
}

export const EJECUTANTE_CONFIG: Record<Ejecutante, { label: string; icon: string }> = {
  equipos_fijos: { label: 'Equipos Fijos',  icon: '⚙️' },
  electricos_ug: { label: 'Eléctricos UG',  icon: '⚡' },
  dek:           { label: 'DEK',            icon: '🔧' },
  soldadura:     { label: 'Soldadura',      icon: '🔥' },
  dek_portones:  { label: 'DEK Portones',   icon: '🚪' },
  dek_hvac:      { label: 'DEK HVAC',       icon: '❄️' },
  inspectores:   { label: 'Inspectores',    icon: '🔍' },
}
