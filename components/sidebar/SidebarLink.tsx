'use client'

import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}

export default function SidebarLink({ href, label, icon: Icon, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group',
        active
          ? 'bg-sky-600/15 text-sky-400 font-medium'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
        )}
      />
      <span className="truncate">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
      )}
    </Link>
  )
}
