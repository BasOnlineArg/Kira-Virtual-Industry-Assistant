'use client'

import { cn } from '@/lib/utils'
import { STATUS_CONFIG, type OtStatus } from '@/lib/work-orders/types'

interface OtStatusBadgeProps {
  status: OtStatus
  size?: 'sm' | 'md'
}

export default function OtStatusBadge({ status, size = 'md' }: OtStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full border',
      cfg.color, cfg.bg, cfg.border,
      size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5',
    )}>
      {cfg.label}
    </span>
  )
}
