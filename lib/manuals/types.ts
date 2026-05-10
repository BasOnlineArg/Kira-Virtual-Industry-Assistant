export type TipoActivo =
  | 'motores' | 'compresores' | 'vdf' | 'cintas' | 'bombas'
  | 'reductores' | 'ventiladores' | 'agitadores' | 'chancadoras' | 'molinos'

export type TipoDoc    = 'manual' | 'pauta'
export type FormatoDoc = 'pdf' | 'imagen' | 'txt'

export interface Manual {
  id:           string
  nombre:       string
  tipoActivo:   TipoActivo
  fabricante:   string
  tipoDoc:      TipoDoc
  formato:      FormatoDoc
  storagePath:  string
  url:          string
  tamanoBytes:  number
  procesado:    boolean
  chunkCount:   number
  uploadedBy?:  string
  createdAt:    string
}

export interface ManualChunk {
  id:          string
  manualId:    string
  sectionPath: string
  pageStart?:  number
  pageEnd?:    number
  chunkIndex:  number
  content:     string
  context:     string
  similarity?: number
}

export interface ChunkCitation {
  chunkId:      string
  manualId:     string
  manualNombre: string
  fabricante:   string
  sectionPath:  string
  pageStart?:   number
  similarity:   number
}

export interface ChatSession {
  id:        string
  userId:    string
  titulo:    string
  manualIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id:         string
  sessionId:  string
  role:       'user' | 'assistant'
  content:    string
  chunksUsed?: ChunkCitation[]
  createdAt:  string
}

// ── Config ────────────────────────────────────────────────────────────────────

export const TIPO_ACTIVO_CONFIG: Record<TipoActivo, { label: string; icon: string }> = {
  motores:      { label: 'Motores',                  icon: '⚡' },
  compresores:  { label: 'Compresores',              icon: '🔄' },
  vdf:          { label: 'Variadores de Frecuencia', icon: '📊' },
  cintas:       { label: 'Cintas Transportadoras',   icon: '🔗' },
  bombas:       { label: 'Bombas',                   icon: '💧' },
  reductores:   { label: 'Reductores',               icon: '⚙️' },
  ventiladores: { label: 'Ventiladores',             icon: '💨' },
  agitadores:   { label: 'Agitadores',               icon: '🌀' },
  chancadoras:  { label: 'Chancadoras',              icon: '🪨' },
  molinos:      { label: 'Molinos',                  icon: '🏭' },
}

export const TIPO_DOC_CONFIG: Record<TipoDoc, {
  label: string; color: string; bg: string; border: string
}> = {
  manual: {
    label:  'Manual Técnico',
    color:  'text-emerald-400',
    bg:     'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  pauta: {
    label:  'Pauta de Mantenimiento',
    color:  'text-blue-400',
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
}
