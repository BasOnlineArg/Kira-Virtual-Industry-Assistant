import type { MineId } from './types'

export const STATUS_COLORS: Record<string, string> = {
  'Operativo':          '#1D9E75',
  'En mantenimiento':   '#EF9F27',
  'Fuera de servicio':  '#E24B4A',
}

// ── Mine configuration ──────────────────────────────────────────────────────

export const MINE_CONFIG: {
  id: MineId
  label: string
  color: string
  hasMap: boolean
  mapFile: string   // relative to /public/maps/
}[] = [
  { id: 'mariana_central', label: 'Mariana Central', color: '#185FA5', hasMap: true, mapFile: 'Mariana Central.jpeg' },
  { id: 'mariana_norte',   label: 'Mariana Norte',   color: '#3B6D11', hasMap: true, mapFile: 'Mariana Norte.jpeg'   },
  { id: 'emilia',          label: 'Emilia',           color: '#854F0B', hasMap: true, mapFile: 'Mina Emilia.jpeg'    },
  { id: 'san_marcos',      label: 'San Marcos',       color: '#993556', hasMap: true, mapFile: 'San Marcos.jpeg'     },
]

// ── Per-mine grid calibration ───────────────────────────────────────────────
//
// Each mine has its own coordinate system and image dimensions.
// Adjust these values by overlaying the grid on the JPG:
//   imgLeft/Right/Top/Bottom → pixel boundaries of the drawn grid area
//   xMin/xMax                → abscisa range on that map
//   mcMin/mcMax              → MC level range on that map
//   naturalW/H               → pixel dimensions of the JPG at 100%
//
// Set CALIBRATED: true once you've verified a mine's values.

export type GridConfig = {
  imgLeft: number; imgRight: number
  imgTop: number;  imgBottom: number
  xMin: number;    xMax: number
  mcMin: number;   mcMax: number
  naturalW: number; naturalH: number
  calibrated: boolean
}

export const MINE_GRID_CONFIGS: Record<MineId, GridConfig> = {
  mariana_central: {
    imgLeft: 47,   imgRight: 1120,
    imgTop:  238,  imgBottom: 695,
    xMin: 552,     xMax: 594,
    mcMin: 300,    mcMax: 600,
    naturalW: 1343, naturalH: 784,
    calibrated: true,
  },
  mariana_norte: {
    imgLeft: 35,   imgRight: 1281,
    imgTop:  222,  imgBottom: 662,
    xMin: 1,       xMax: 45,
    mcMin: 280,    mcMax: 620,
    naturalW: 1557, naturalH: 672,
    calibrated: true,
  },
  emilia: {
    imgLeft: 176,  imgRight: 1552,
    imgTop:  118,  imgBottom: 668,
    xMin: 17,      xMax: 47,
    mcMin: 255,    mcMax: 500,
    naturalW: 1557, naturalH: 672,
    calibrated: true,
  },
  san_marcos: {
    imgLeft: 41,   imgRight: 1504,
    imgTop:  211,  imgBottom: 700,
    xMin: 10,      xMax: 43,
    mcMin: 300,    mcMax: 600,
    naturalW: 1510, naturalH: 704,
    calibrated: true,
  },
}

// ── Surface map ─────────────────────────────────────────────────────────────

export const SURFACE_CENTER: [number, number] = [-46.8637, -70.3268]
export const SURFACE_ZOOM = 16

// ── Asset type icons ────────────────────────────────────────────────────────

export const TIPO_ICONS: Record<string, string> = {
  'Edificio':               '🏢',
  'Equipo industrial':      '⚙️',
  'Equipo de izaje':        '🏗️',
  'Vehículo':               '🚛',
  'Tubería':                '🔩',
  'Bomba':                  '💧',
  'Compresor':              '🔧',
  'Transformador':          '⚡',
  'Cinta transportadora':   '📦',
  'default':                '📍',
}
