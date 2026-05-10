// Deprecated: storage moved to Supabase via /api/work-orders
// This file is kept as a no-op stub to avoid breaking any residual imports.
import type { WorkOrder } from './types'

/** @deprecated Use /api/work-orders GET instead */
export function loadWorkOrders(): WorkOrder[] { return [] }

/** @deprecated Use /api/work-orders POST/PATCH instead */
export function saveWorkOrders(_orders: WorkOrder[]): void {}
