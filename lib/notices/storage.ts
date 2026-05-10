// Deprecated: storage moved to Supabase via /api/notices
// This file is kept as a no-op stub to avoid breaking any residual imports.
import type { Aviso } from './types'

/** @deprecated Use /api/notices GET instead */
export function loadAvisos(): Aviso[] { return [] }

/** @deprecated Use /api/notices POST/PATCH instead */
export function saveAvisos(_avisos: Aviso[]): void {}
