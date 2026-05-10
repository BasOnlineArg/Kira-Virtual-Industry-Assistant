export interface W5H2 {
  what:     string
  who:      string
  where:    string
  when:     string
  why:      string
  how:      string
  how_much: string
  photos:   string[]   // data URLs
}

export interface Cause {
  id:    string
  texto: string
}

export type CategoryId =
  | 'mano_obra'
  | 'maquina'
  | 'metodo'
  | 'material'
  | 'medio_ambiente'
  | 'medicion'

export type IshikawaData = Record<CategoryId, Cause[]>

export type PorguesData = Record<string, string[]> // cause id → [why1…why5]

export interface TimelineEvent {
  momento:     string
  descripcion: string
  tipo:        'inicio' | 'escalada' | 'critico' | 'fin'
}

export interface CorrectiveAction {
  accion:      string
  responsable: string
  plazo:       string
}

export interface AnalysisResult {
  causaRaiz:            string
  causasContribuyentes: string[]
  nivelRiesgoResidual:  'Crítico' | 'Alto' | 'Medio' | 'Bajo'
  accionesCorrectivas:  CorrectiveAction[]
  leccionesAprendidas:  string[]
  patronesMonitorear:   string[]
  conclusionEjecutiva:  string
  lineaTiempo:          TimelineEvent[]
}

export const CATEGORIES: { id: CategoryId; label: string; icon: string; color: string }[] = [
  { id: 'mano_obra',      label: 'Mano de Obra',  icon: '👷', color: '#38bdf8' },
  { id: 'maquina',        label: 'Máquina',        icon: '⚙️', color: '#34d399' },
  { id: 'metodo',         label: 'Método',         icon: '📋', color: '#fbbf24' },
  { id: 'material',       label: 'Material',       icon: '🧱', color: '#f87171' },
  { id: 'medio_ambiente', label: 'Medio Ambiente', icon: '🌿', color: '#a78bfa' },
  { id: 'medicion',       label: 'Medición',       icon: '📏', color: '#fb923c' },
]

export type BranchPhotos = Record<CategoryId, string[]>

export const EMPTY_ISHIKAWA: IshikawaData = {
  mano_obra: [], maquina: [], metodo: [], material: [], medio_ambiente: [], medicion: [],
}

export const EMPTY_BRANCH_PHOTOS: BranchPhotos = {
  mano_obra: [], maquina: [], metodo: [], material: [], medio_ambiente: [], medicion: [],
}

export const EMPTY_W5H2: W5H2 = {
  what: '', who: '', where: '', when: '', why: '', how: '', how_much: '', photos: [],
}
