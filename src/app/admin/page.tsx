'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Users, Shield, Database, Settings } from 'lucide-react'
import { useAuth } from '@/components/auth/SessionProvider'
import { authFetch } from '@/lib/auth-fetch'
import { Button } from '@/components/ui/button'

interface PlatformStats {
  totalCouples: number
  totalWeddings: number
  totalGuests: number
  activeSubscriptions: number
}

interface WeddingTenant {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  subscriptionTier: string
  createdAt: string
  _count?: {
    guests: number
    users: number
  }
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [tenants, setTenants] = useState<WeddingTenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Basic client-side check. API will strictly enforce this.
    if (!authLoading && (!user || user.role !== 'superadmin')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || user.role !== 'superadmin') return

    const fetchAdminData = async () => {
      try {
        setLoading(true)
        const response = await authFetch('/api/admin/platform-stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
          setTenants(data.tenants)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (!user || user.role !== 'superadmin') return null

  return (
    <div className="min-h-screen bg-stone-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif text-stone-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-rose-500" />
              SaaS Admin
            </h1>
            <p className="text-stone-500 mt-2">Visão Global da Plataforma</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            Voltar ao App
          </Button>
        </header>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-stone-100 rounded-xl text-stone-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">Casais (Tenants)</p>
                <h3 className="text-2xl font-bold text-stone-900">{stats?.totalWeddings || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">Total de Convidados</p>
                <h3 className="text-2xl font-bold text-stone-900">{stats?.totalGuests || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant List */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h2 className="text-xl font-medium text-stone-900">Casamentos Ativos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-sm">
                  <th className="px-6 py-4 font-medium">Casal</th>
                  <th className="px-6 py-4 font-medium">Data do Casamento</th>
                  <th className="px-6 py-4 font-medium">Plano</th>
                  <th className="px-6 py-4 font-medium">Criado em</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">
                        {tenant.partner1Name} & {tenant.partner2Name}
                      </div>
                      <div className="text-xs text-stone-400 mt-1 font-mono">
                        {tenant.id.split('-')[0]}...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {new Date(tenant.weddingDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        tenant.subscriptionTier === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        {tenant.subscriptionTier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-sm">
                      {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-900">
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar
                      </Button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                      Nenhum casamento registrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}
