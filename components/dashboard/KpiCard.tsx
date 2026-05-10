import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  label:     string
  value:     string | number
  sub?:      string
  icon:      LucideIcon
  variant?:  Variant
  pulse?:    boolean   // animate-ping dot for critical alerts
  unit?:     string
}

const VARIANT_STYLES: Record<Variant, {
  card: string; icon: string; value: string; dot?: string
}> = {
  default: {
    card:  'border-slate-700/50 bg-slate-800/40',
    icon:  'text-slate-400  bg-slate-700/40',
    value: 'text-slate-100',
  },
  success: {
    card:  'border-emerald-500/20 bg-emerald-500/5',
    icon:  'text-emerald-400 bg-emerald-500/15',
    value: 'text-emerald-400',
  },
  warning: {
    card:  'border-amber-500/20  bg-amber-500/5',
    icon:  'text-amber-400  bg-amber-500/15',
    value: 'text-amber-400',
  },
  danger: {
    card:  'border-red-500/30    bg-red-500/5',
    icon:  'text-red-400    bg-red-500/15',
    value: 'text-red-400',
    dot:   'bg-red-500',
  },
  info: {
    card:  'border-sky-500/20   bg-sky-500/5',
    icon:  'text-sky-400   bg-sky-500/15',
    value: 'text-sky-400',
  },
}

export default function KpiCard({ label, value, sub, icon: Icon, variant = 'default', pulse, unit }: Props) {
  const s = VARIANT_STYLES[variant]

  return (
    <div className={cn('relative rounded-2xl border p-4 flex items-start gap-3', s.card)}>

      {/* Pulse dot */}
      {pulse && s.dot && (
        <span className="absolute top-3 right-3">
          <span className={cn('relative flex h-2 w-2')}>
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', s.dot)} />
            <span className={cn('relative inline-flex rounded-full h-2 w-2', s.dot)} />
          </span>
        </span>
      )}

      {/* Icon */}
      <div className={cn('shrink-0 p-2.5 rounded-xl', s.icon)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className={cn('text-2xl font-bold mt-0.5 tabular-nums', s.value)}>
          {value}{unit && <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>}
        </p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}
