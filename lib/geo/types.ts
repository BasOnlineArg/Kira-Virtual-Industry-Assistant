export interface ChecklistItem {
  descripcion: string
  resultado: boolean
  nota?: string
}

export interface HistorialItem {
  fecha: string
  texto: string
  estado: 'ok' | 'warn'
}

export interface Asset {
  id: string
  tag: string
  nombre: string
  tipo: string
  capa: 'superficie' | 'subterraneo'
  sector: string
  mina?: string
  lat?: number
  lng?: number
  ug_x?: number
  ug_y?: number
  status: 'Operativo' | 'En mantenimiento' | 'Fuera de servicio'
  estado?: string
  ubicacion?: string
  inspector_asignado?: string
  ultima_inspeccion?: string
  proxima_inspeccion?: string
  checklist?: ChecklistItem[]
  historial?: HistorialItem[]
}

export type Capa = 'superficie' | 'subterraneo'
export type MineId = 'mariana_central' | 'mariana_norte' | 'emilia' | 'san_marcos'
