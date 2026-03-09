'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, CheckCircle, XCircle, Loader2, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  is_approved: boolean
  created_at: string
}

const ROLE_LABELS = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador'
}

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-stone-100 text-stone-600'
}

export function UserManager() {
  const { tenantId } = useTenant()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      const r = await tenantFetch('/api/users', tenantId)
      const data = await r.json()
      if (data.success) {
        setProfiles(data.data)
      }
    } catch {
      toast.error('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleUpdate = async (id: string, updates: Partial<Profile>) => {
    setUpdatingId(id)
    try {
      const r = await tenantFetch('/api/users', tenantId, {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates })
      })
      const data = await r.json()
      if (data.success) {
        toast.success('Usuário atualizado')
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
      }
    } catch {
      toast.error('Erro ao atualizar usuário')
    } finally {
      setUpdatingId(null)
    }
  }

  const fmtDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800 uppercase tracking-tight">Gestão de Usuários</h2>
          <p className="text-sm text-stone-500">{profiles.length} usuários cadastrados</p>
        </div>
        <Users className="h-6 w-6 text-stone-400" />
      </div>

      <div className="grid gap-4">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-stone-800 truncate">{profile.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {fmtDate(profile.created_at)}
                    </span>
                    <Badge className={`text-[10px] sm:hidden ${ROLE_COLORS[profile.role]}`}>
                      {ROLE_LABELS[profile.role]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-stone-50 pt-4 sm:border-0 sm:pt-0">
                <div className="hidden sm:block">
                  <Badge className={`px-2 py-0.5 text-xs ${ROLE_COLORS[profile.role]}`}>
                    {ROLE_LABELS[profile.role]}
                  </Badge>
                </div>

                <Select
                  value={profile.role}
                  onValueChange={(v: 'admin' | 'editor' | 'viewer') => handleUpdate(profile.id, { role: v })}
                  disabled={updatingId === profile.id}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Mudar Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>

                {profile.is_approved ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleUpdate(profile.id, { is_approved: false })}
                    disabled={updatingId === profile.id}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Revogar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                    onClick={() => handleUpdate(profile.id, { is_approved: true })}
                    disabled={updatingId === profile.id}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Aprovar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-8 text-center text-stone-400">
          Nenhum usuário encontrado.
        </div>
      )}
    </div>
  )
}
