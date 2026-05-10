// FRM templates per structural type
// Score 1-5: 1=Crítico · 2=Deficiente · 3=Regular · 4=Bueno · 5=Excelente

export interface ChecklistItem {
  id: string
  item: string
  score: number   // 1-5, 0 = not scored yet
  observacion: string
}

export interface ChecklistCategory {
  categoria: string
  items: ChecklistItem[]
}

type Template = ChecklistCategory[]

function item(id: string, label: string): ChecklistItem {
  return { id, item: label, score: 0, observacion: '' }
}

// ─── Templates ────────────────────────────────────────────────────────────────

const ESTRUCTURA_METALICA: Template = [
  {
    categoria: 'Corrosión y protección superficial',
    items: [
      item('em-01', 'Estado del recubrimiento / pintura general'),
      item('em-02', 'Corrosión activa en elementos principales'),
      item('em-03', 'Corrosión en uniones y soldaduras'),
      item('em-04', 'Zonas de acumulación de humedad'),
    ],
  },
  {
    categoria: 'Integridad estructural',
    items: [
      item('em-05', 'Deformaciones y pandeo visibles'),
      item('em-06', 'Fisuras y grietas en elementos'),
      item('em-07', 'Estado de soldaduras y cordones'),
      item('em-08', 'Conexiones y uniones atornilladas'),
    ],
  },
  {
    categoria: 'Elementos de sujeción',
    items: [
      item('em-09', 'Bulones, tornillos y tuercas'),
      item('em-10', 'Apoyos y vinculaciones a fundación'),
      item('em-11', 'Arriostramientos y diagonales'),
    ],
  },
  {
    categoria: 'Condiciones de carga y entorno',
    items: [
      item('em-12', 'Cargas no previstas (equipos, materiales)'),
      item('em-13', 'Daños por impacto de equipos'),
      item('em-14', 'Drenaje de aguas pluviales'),
    ],
  },
]

const FUNDACION: Template = [
  {
    categoria: 'Estado superficial del hormigón',
    items: [
      item('fu-01', 'Fisuras y grietas en hormigón'),
      item('fu-02', 'Descascarado y exposición de armadura'),
      item('fu-03', 'Eflorescencias y manchas de humedad'),
      item('fu-04', 'Carbonatación visible'),
    ],
  },
  {
    categoria: 'Geometría y asentamientos',
    items: [
      item('fu-05', 'Asentamientos diferenciales'),
      item('fu-06', 'Desplome o inclinación'),
      item('fu-07', 'Socavación del terreno de apoyo'),
    ],
  },
  {
    categoria: 'Entorno e hidrogeología',
    items: [
      item('fu-08', 'Drenaje superficial perimetral'),
      item('fu-09', 'Acumulación de agua / inundación'),
      item('fu-10', 'Erosión del terreno circundante'),
    ],
  },
]

const EDIFICIO_GALPON: Template = [
  {
    categoria: 'Estructura resistente',
    items: [
      item('eg-01', 'Estado de columnas y vigas principales'),
      item('eg-02', 'Corrosión en estructura metálica'),
      item('eg-03', 'Fisuras en elementos de hormigón'),
      item('eg-04', 'Uniones y conexiones'),
    ],
  },
  {
    categoria: 'Cubierta y cerramiento',
    items: [
      item('eg-05', 'Estado de chapa o membrana de cubierta'),
      item('eg-06', 'Estanqueidad (filtraciones de agua)'),
      item('eg-07', 'Estado de cerramientos laterales'),
      item('eg-08', 'Canaletas y bajadas pluviales'),
    ],
  },
  {
    categoria: 'Piso y solado',
    items: [
      item('eg-09', 'Fisuras y asentamientos en piso'),
      item('eg-10', 'Desniveles y rampas de acceso'),
    ],
  },
  {
    categoria: 'Instalaciones generales',
    items: [
      item('eg-11', 'Estado de portones y accesos'),
      item('eg-12', 'Iluminación y ventilación'),
      item('eg-13', 'Señalización de emergencia'),
    ],
  },
]

const ESCALERA_PLATAFORMA: Template = [
  {
    categoria: 'Estructura soporte',
    items: [
      item('ep-01', 'Estado de vigas y columnas de soporte'),
      item('ep-02', 'Corrosión general'),
      item('ep-03', 'Uniones soldadas y atornilladas'),
    ],
  },
  {
    categoria: 'Superficie de tránsito',
    items: [
      item('ep-04', 'Grating / piso antideslizante'),
      item('ep-05', 'Aberturas y huecos sin cubrir'),
      item('ep-06', 'Estado de escalones y peldaños'),
    ],
  },
  {
    categoria: 'Barandas y protecciones',
    items: [
      item('ep-07', 'Altura mínima de barandas (1.10 m)'),
      item('ep-08', 'Continuidad y estado de barandas'),
      item('ep-09', 'Zócalos de seguridad'),
      item('ep-10', 'Anclajes de barandas a estructura'),
    ],
  },
  {
    categoria: 'Fijaciones y anclajes',
    items: [
      item('ep-11', 'Anclajes a estructura principal'),
      item('ep-12', 'Estado de pie de escalera'),
    ],
  },
]

const TANQUE_RECIPIENTE: Template = [
  {
    categoria: 'Integridad del casco',
    items: [
      item('tr-01', 'Corrosión externa en paredes'),
      item('tr-02', 'Corrosión interna (si inspeccionable)'),
      item('tr-03', 'Fisuras, picaduras y perforaciones'),
      item('tr-04', 'Estado de soldaduras y juntas'),
    ],
  },
  {
    categoria: 'Fondo y techo',
    items: [
      item('tr-05', 'Estado del fondo (abolladuras, corrosión)'),
      item('tr-06', 'Estado del techo o pontón flotante'),
      item('tr-07', 'Sellos y membranas'),
    ],
  },
  {
    categoria: 'Accesorios y conexiones',
    items: [
      item('tr-08', 'Boquillas, nozzles y válvulas'),
      item('tr-09', 'Escaleras de acceso externas'),
      item('tr-10', 'Bocas de hombre e inspección'),
    ],
  },
  {
    categoria: 'Estructura soporte y fundación',
    items: [
      item('tr-11', 'Sillas de apoyo y anillos de rigidez'),
      item('tr-12', 'Fundación y nivelación'),
      item('tr-13', 'Sistema de contención secundaria'),
    ],
  },
]

const CINTA_TRANSPORTADORA: Template = [
  {
    categoria: 'Estructura de soporte',
    items: [
      item('ct-01', 'Estado de chasis y vigas longitudinales'),
      item('ct-02', 'Corrosión general de estructura'),
      item('ct-03', 'Patas, soportes y anclajes'),
    ],
  },
  {
    categoria: 'Sistema de rodillos',
    items: [
      item('ct-04', 'Estado de rodillos portantes (desgaste, atascamiento)'),
      item('ct-05', 'Estado de rodillos de retorno'),
      item('ct-06', 'Alineación de rodillos'),
    ],
  },
  {
    categoria: 'Correa',
    items: [
      item('ct-07', 'Estado superficial de la correa'),
      item('ct-08', 'Empalmes y vulcanizados'),
      item('ct-09', 'Alineación y centrado de correa'),
    ],
  },
  {
    categoria: 'Seguridades y protecciones',
    items: [
      item('ct-10', 'Guardas y cubiertas de protección'),
      item('ct-11', 'Tiradores de emergencia (pull cords)'),
      item('ct-12', 'Limpiadores y raspadores de correa'),
    ],
  },
]

const GALERIA_TUNEL: Template = [
  {
    categoria: 'Sostenimiento',
    items: [
      item('gt-01', 'Estado de pernos y anclajes'),
      item('gt-02', 'Malla electrosoldada y shotcrete'),
      item('gt-03', 'Arcos y cimbras metálicas'),
      item('gt-04', 'Tensión y pretensado de pernos'),
    ],
  },
  {
    categoria: 'Techo y hastiales',
    items: [
      item('gt-05', 'Estabilidad general del techo'),
      item('gt-06', 'Condición de hastiales laterales'),
      item('gt-07', 'Presencia de bloques o cuñas sueltas'),
      item('gt-08', 'Convergencia / deformación de la labor'),
    ],
  },
  {
    categoria: 'Drenaje e hidrogeología',
    items: [
      item('gt-09', 'Funcionamiento de cunetas de drenaje'),
      item('gt-10', 'Filtraciones e infiltraciones activas'),
      item('gt-11', 'Acumulación de agua en piso'),
    ],
  },
  {
    categoria: 'Acceso y vialidad',
    items: [
      item('gt-12', 'Perfil de excavación y gálibo'),
      item('gt-13', 'Estado de piso y calzada'),
      item('gt-14', 'Señalización y refugios de emergencia'),
    ],
  },
]

const PUENTE_ACCESO: Template = [
  {
    categoria: 'Tablero y superficie de rodado',
    items: [
      item('pa-01', 'Estado del tablero (plancha, hormigón)'),
      item('pa-02', 'Juntas de dilatación'),
      item('pa-03', 'Drenaje del tablero'),
    ],
  },
  {
    categoria: 'Estructura principal',
    items: [
      item('pa-04', 'Vigas principales longitudinales'),
      item('pa-05', 'Vigas transversales y diafragmas'),
      item('pa-06', 'Corrosión en elementos metálicos'),
      item('pa-07', 'Uniones soldadas y atornilladas'),
    ],
  },
  {
    categoria: 'Apoyos y estribos',
    items: [
      item('pa-08', 'Estado de aparatos de apoyo'),
      item('pa-09', 'Estribos y pilas de hormigón'),
      item('pa-10', 'Cimentación y socavación'),
    ],
  },
  {
    categoria: 'Barandas y seguridades',
    items: [
      item('pa-11', 'Barandas peatonales y vehiculares'),
      item('pa-12', 'Señalización de carga máxima'),
    ],
  },
]

// ─── Registry ─────────────────────────────────────────────────────────────────

export const STRUCTURAL_TYPES = [
  'Estructura metálica',
  'Fundación',
  'Edificio / Galpón',
  'Escalera / Plataforma',
  'Tanque / Recipiente',
  'Cinta transportadora',
  'Galería / Túnel',
  'Puente de acceso',
] as const

export type StructuralType = typeof STRUCTURAL_TYPES[number]

export const TEMPLATE_MAP: Record<StructuralType, Template> = {
  'Estructura metálica':   ESTRUCTURA_METALICA,
  'Fundación':             FUNDACION,
  'Edificio / Galpón':     EDIFICIO_GALPON,
  'Escalera / Plataforma': ESCALERA_PLATAFORMA,
  'Tanque / Recipiente':   TANQUE_RECIPIENTE,
  'Cinta transportadora':  CINTA_TRANSPORTADORA,
  'Galería / Túnel':       GALERIA_TUNEL,
  'Puente de acceso':      PUENTE_ACCESO,
}

export const SECTORS = [
  'Superficie',
  'Mina Mariana Central',
  'Mina Mariana Norte',
  'Mina Emilia',
  'Mina San Marcos',
  'Planta de Proceso',
  'Talleres / Truckshop',
  'Infraestructura vial',
] as const

export const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Crítico',    color: 'bg-red-600 text-white' },
  2: { label: 'Deficiente', color: 'bg-orange-500 text-white' },
  3: { label: 'Regular',    color: 'bg-amber-400 text-slate-900' },
  4: { label: 'Bueno',      color: 'bg-sky-500 text-white' },
  5: { label: 'Excelente',  color: 'bg-emerald-500 text-white' },
}

/** Compute overall score percentage (0–100) from all scored items */
export function computeScore(categories: ChecklistCategory[]): number {
  const items = categories.flatMap((c) => c.items).filter((i) => i.score > 0)
  if (items.length === 0) return 0
  const avg = items.reduce((s, i) => s + i.score, 0) / items.length
  return Math.round(((avg - 1) / 4) * 100) // map 1–5 → 0–100
}

/** Estado based on score */
export function scoreToEstado(score: number): 'aprobada' | 'observada' | 'rechazada' {
  if (score >= 70) return 'aprobada'
  if (score >= 50) return 'observada'
  return 'rechazada'
}

/** Deep-clone a template (so state is independent per inspection) */
export function cloneTemplate(type: StructuralType): ChecklistCategory[] {
  return TEMPLATE_MAP[type].map((cat) => ({
    ...cat,
    items: cat.items.map((it) => ({ ...it })),
  }))
}
