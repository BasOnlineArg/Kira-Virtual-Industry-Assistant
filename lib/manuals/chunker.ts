// Contextual Retrieval chunker
// Each chunk is enriched with document metadata + section path before embedding.
// This dramatically improves retrieval accuracy for technical industrial documents.

interface ChunkMeta {
  nombre:     string
  tipoActivo: string
  fabricante: string
  tipoDoc:    string
}

export interface RawChunk {
  content:     string   // original text
  context:     string   // enriched text (what gets embedded)
  chunkIndex:  number
  sectionPath: string
}

const CHUNK_WORDS = 380   // target words per chunk
const OVERLAP_WORDS = 50  // overlap between consecutive chunks

/**
 * Split text into overlapping chunks with contextual prefix.
 * Respects paragraph and section boundaries when possible.
 */
export function chunkText(text: string, meta: ChunkMeta): RawChunk[] {
  // Normalize whitespace
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Split into paragraphs (2+ newlines = paragraph break)
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15)

  const chunks: RawChunk[] = []
  let currentParas: string[] = []
  let wordCount = 0
  let chunkIndex = 0
  let currentSection = ''

  const flush = () => {
    if (currentParas.length === 0) return
    const content = currentParas.join('\n\n')
    chunks.push({
      content,
      context: buildContext(content, meta, currentSection, chunkIndex),
      chunkIndex,
      sectionPath: currentSection,
    })
    chunkIndex++

    // Keep overlap: last N words as seed for next chunk
    const allWords = content.split(/\s+/)
    const overlapText = allWords.slice(-OVERLAP_WORDS).join(' ')
    currentParas = overlapText ? [overlapText] : []
    wordCount = overlapText ? OVERLAP_WORDS : 0
  }

  for (const para of paragraphs) {
    // Detect section headers: ALL CAPS line, or numbered section "3.2 Title"
    const trimmed = para.trim()
    const isHeader =
      (/^[A-ZÁÉÍÓÚÑ\d\s\.\-]{4,60}$/.test(trimmed) && trimmed === trimmed.toUpperCase()) ||
      /^\d+(\.\d+)*\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed)

    if (isHeader) {
      currentSection = trimmed.substring(0, 100)
    }

    const words = para.split(/\s+/).length

    if (wordCount + words > CHUNK_WORDS && wordCount > OVERLAP_WORDS) {
      flush()
    }

    currentParas.push(para)
    wordCount += words
  }

  flush() // last chunk

  return chunks
}

function buildContext(content: string, meta: ChunkMeta, sectionPath: string, index: number): string {
  const tipoLabel = meta.tipoDoc === 'manual' ? 'Manual Técnico' : 'Pauta de Mantenimiento'
  return [
    `[${tipoLabel}: ${meta.nombre}]`,
    `[Equipo: ${meta.tipoActivo} | Fabricante: ${meta.fabricante}]`,
    sectionPath ? `[Sección: ${sectionPath}]` : '[Sección: General]',
    `[Fragmento ${index + 1}]`,
    '',
    content,
  ].join('\n')
}
