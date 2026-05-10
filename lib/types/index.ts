// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'superusuario' | 'inspector' | 'supervisor'

export interface KiraUser {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  created_at: string
}

// ─── Assets ─────────────────────────────────────────────────────────────────

export type AssetSector = 'superficie' | 'subterranea' | 'planta_caf' | 'truckshop'
export type AssetMina = 'mariana_central' | 'mariana_norte' | 'emilia' | 'san_marcos' | 'superficie'
export type AssetStatus = 'operativo' | 'mantenimiento' | 'fuera_de_servicio'

export interface Asset {
  id: string
  tag: string
  nombre: string
  tipo: string
  categoria: string | null
  sector: AssetSector | null
  mina: AssetMina | null
  lat: number | null
  lng: number | null
  ug_x: number | null
  ug_y: number | null
  status: AssetStatus
  estado: string | null
  created_at: string
}

// ─── Inspections ─────────────────────────────────────────────────────────────

export type InspectionType = 'rutina' | 'preventiva' | 'correctiva' | 'predictiva' | 'emergencia'
export type ChecklistResult = 'ok' | 'observacion' | 'falla'

export interface Inspection {
  id: string
  asset_id: string | null
  tipo: InspectionType
  inspector_id: string | null
  fecha: string
  estado_general: string | null
  score: number | null
  notas: string | null
  created_at: string
}

export interface ChecklistItem {
  id: string
  inspection_id: string
  asset_id: string | null
  descripcion: string
  resultado: ChecklistResult | null
  nota: string | null
  foto_url: string | null
  created_at: string
}

// ─── Analysis Modules ────────────────────────────────────────────────────────

export type Severity = 'ALTA' | 'MEDIA' | 'BAJA'

export interface VisualAnalysis {
  id: string
  asset_id: string | null
  inspector_id: string | null
  fecha: string
  severidad: Severity | null
  diagnostico: string | null
  base_metodologica: string | null
  recomendaciones: string | null
  foto_url: string | null
  created_at: string
}

export interface AudioAnalysis {
  id: string
  asset_id: string | null
  inspector_id: string | null
  fecha: string
  rms: number | null
  kurtosis: number | null
  peak_freq: number | null
  falla_prob: number | null
  rul: string | null
  diagnostico: string | null
  tipo_equipo: string | null
  created_at: string
}

export type IsoClass = 'I' | 'II' | 'III' | 'IV'
export type SkfStatus = 'verde' | 'amarillo' | 'rojo'

export interface SkfMeasurement {
  id: string
  asset_id: string | null
  inspector_id: string | null
  fecha: string
  velocity_rms: number | null
  envelope_ge: number | null
  temperatura: number | null
  iso_class: IsoClass | null
  estado: SkfStatus | null
  diagnostico: string | null
  created_at: string
}

// ─── Work Orders & Notices ───────────────────────────────────────────────────

export type WorkOrderStatus = 'en_proceso' | 'cumplida' | 'anulada' | 'reprogramada'

export interface WorkOrder {
  id: string
  ot_number: string
  asset_id: string | null
  descripcion: string
  status: WorkOrderStatus
  hh_programadas: number
  hhr_reales: number
  fecha_ejecucion: string | null
  semana_iso: number | null
  created_at: string
}

export type NoticePriority = 'MN' | 'MI' | 'BKL' | 'PP'
export type NoticeEquipo = 'equipos_fijos' | 'soldadura' | 'electricos' | 'dek'

export interface Notice {
  id: string
  asset_id: string | null
  prioridad: NoticePriority
  titulo: string
  descripcion: string | null
  equipo_asignado: NoticeEquipo | null
  generado_sap: boolean
  fecha: string
  created_at: string
}

// ─── Research & Manuals ──────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ResearchSession {
  id: string
  user_id: string
  titulo: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface Manual {
  id: string
  nombre: string
  tipo: 'oem' | 'pauta_mantenimiento' | null
  categoria_equipo: string | null
  oem: string | null
  file_url: string | null
  created_at: string
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  user_id: string | null
  accion: string
  tabla: string
  registro_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
