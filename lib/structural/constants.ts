// Constants for Structural Inspections module

export const INSPECTION_TYPES = [
  'Rutina',
  'Preventiva',
  'Correctiva',
  'Predictiva',
  'Emergencia',
] as const

export const CONDITION_STATES = [
  { value: 'bueno',    label: 'Bueno',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { value: 'regular',  label: 'Regular',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  { value: 'malo',     label: 'Malo',     color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30' },
  { value: 'critico',  label: 'Crítico',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
] as const

export const NDT_TOOLS = [
  { id: 'vibrometro',     label: 'Vibrómetro' },
  { id: 'boroscopio',     label: 'Boroscopio' },
  { id: 'termografia',    label: 'Termografía infrarroja' },
  { id: 'ultrasonido',    label: 'Ultrasonido' },
  { id: 'liq_penetrantes',label: 'Líquidos penetrantes' },
  { id: 'part_magneticas',label: 'Partículas magnéticas' },
  { id: 'radiografia',    label: 'Radiografía industrial' },
  { id: 'emision_acustica',label: 'Emisión acústica' },
] as const

export const FRM_RISKS = [
  { id: 'espacio_confinado',          label: 'Espacio Confinado',                              icon: '🕳️' },
  { id: 'contacto_electricidad',      label: 'Contacto con Electricidad',                      icon: '⚡' },
  { id: 'liberacion_energia',         label: 'Liberación Descontrolada de Energía',            icon: '💥' },
  { id: 'atrapamiento_rotativos',     label: 'Atrapamiento en Equipos Rotativos',              icon: '⚙️' },
  { id: 'caida_altura',               label: 'Caída de Altura',                                icon: '🏗️' },
  { id: 'inestabilidad_superficie',   label: 'Inestabilidad del Terreno — Superficie',         icon: '🌍' },
  { id: 'colision_vuelco_sitio',      label: 'Colisión o Vuelco de Vehículo (en sitio)',       icon: '🚛' },
  { id: 'incidente_neumaticos',       label: 'Incidente con Neumáticos',                       icon: '🛞' },
  { id: 'gruas_izajes',               label: 'Grúas e Izajes',                                 icon: '🏗️' },
  { id: 'inestabilidad_underground',  label: 'Inestabilidad del Terreno — Underground',        icon: '⛏️' },
  { id: 'caida_objetos',              label: 'Golpes por Caída de Objetos',                    icon: '🪨' },
  { id: 'caida_vehiculo_pesado',      label: 'Caída de Vehículo Pesado al Vacío',              icon: '🚚' },
  { id: 'incendio_explosion_ug',      label: 'Incendio o Explosión Underground',               icon: '🔥' },
  { id: 'colision_vuelco_fuera',      label: 'Colisión o Vuelco de Vehículo — Fuera de sitio', icon: '🚗' },
  { id: 'interaccion_peaton_sup',     label: 'Interacción Vehículo y Peatón — Superficie',     icon: '🚶' },
  { id: 'interaccion_peaton_ug',      label: 'Interacción Vehículo y Peatón — Underground',    icon: '👷' },
  { id: 'material_peligroso',         label: 'Material Peligroso',                             icon: '☢️' },
  { id: 'explosivos',                 label: 'Manipulación de Explosivos',                     icon: '🧨' },
  { id: 'aviacion',                   label: 'Pérdida de Control Aviación',                    icon: '✈️' },
  { id: 'gases_polvos',               label: 'Exposición a Gases y Polvos',                    icon: '😷' },
  { id: 'caida_agua',                 label: 'Caída a Fuentes de Agua',                        icon: '💧' },
  { id: 'excavaciones_zanjas',        label: 'Excavaciones y Zanjas',                          icon: '🪚' },
  { id: 'obras_temporales',           label: 'Obras Temporales',                               icon: '🏚️' },
] as const

// Risk score = Criticidad × Frecuencia × Impacto (max 125)
export function riskScore(c: number, f: number, i: number): number {
  return c * f * i
}

export function riskLevel(score: number): {
  label: string; color: string; bg: string; textColor: string
} {
  if (score <= 25)  return { label: 'Bajo',     color: 'bg-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', textColor: 'text-emerald-400' }
  if (score <= 50)  return { label: 'Medio',    color: 'bg-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',   textColor: 'text-amber-400' }
  if (score <= 75)  return { label: 'Alto',     color: 'bg-orange-500',  bg: 'bg-orange-500/10 border-orange-500/30', textColor: 'text-orange-400' }
  return              { label: 'Crítico',  color: 'bg-red-600',     bg: 'bg-red-500/10 border-red-500/30',     textColor: 'text-red-400' }
}

export const RISK_SCALE_LABELS: Record<number, string> = {
  1: '1 — Muy bajo',
  2: '2 — Bajo',
  3: '3 — Moderado',
  4: '4 — Alto',
  5: '5 — Muy alto',
}
