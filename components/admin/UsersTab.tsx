'use client'

import { useState } from 'react'
import { Shield, UserCheck, UserX, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'superusuario' | 'supervisor' | 'inspector'

interface KiraUser {
  id:         string
  email:      string
  name:       string
  role:       Role
  active:     boolean
  created_at: string
}

const ROLE_STYLES: Record<Role, string> = {
  superusuario: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  supervisor:   'bg-sky-500/15    text-sky-400    border-sky-500/20',
  inspector:    'bg-slate-600/40  text-slate-300  border-slate-600/30',
}

const ROLES: Role[] = ['inspector', 'supervisor', 'superusuario']

export default function UsersTab({ initialUsers }: { initialUsers: KiraUser[] }) {
  const [users, setUsers]   = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)

  async function patchUser(id: string, update: Partial<KiraUser>) {
    setLoading(id)
    const res = await fetch('/api/admin/users', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, ...update }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...updated } : u))
    }
    setLoading(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {users.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-10">Sin usuarios registrados.</p>
      )}

      {users.map((u) => (
        <div
          key={u.id}
          className={cn(
            'rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3',
            u.active ? 'border-slate-700/50 bg-slate-800/40' : 'border-slate-700/30 bg-slate-900/40 opacity-60',
          )}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-sm font-bold text-slate-300 uppercase">
            {u.name?.charAt(0) ?? u.email.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{u.name || '—'}</p>
            <p className="text-xs text-slate-500 truncate">{u.email}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Desde {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Role selector */}
          <div className="relative shrink-0">
            <select
              value={u.role}
              disabled={loading === u.id}
              onChange={(e) => patchUser(u.id, { role: e.target.value as Role })}
              className={cn(
                'appearance-none rounded-full border px-3 py-1 pr-7 text-xs font-medium cursor-pointer',
                'bg-transparent focus:outline-none focus:ring-1 focus:ring-slate-500',
                ROLE_STYLES[u.role],
              )}
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-slate-800 text-slate-200">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
          </div>

          {/* Active toggle */}
          <button
            onClick={() => patchUser(u.id, { active: !u.active })}
            disabled={loading === u.id}
            title={u.active ? 'Desactivar usuario' : 'Activar usuario'}
            className={cn(
              'shrink-0 p-2 rounded-xl transition-colors',
              u.active
                ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                : 'text-slate-500 bg-slate-700/30 hover:bg-slate-700/50',
            )}
          >
            {u.active ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </button>
        </div>
      ))}
    </div>
  )
}
