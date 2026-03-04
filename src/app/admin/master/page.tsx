'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, Users, CreditCard, Trash2, UserPlus, RefreshCcw, Activity, ShieldCheck, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authFetch } from '@/lib/auth-fetch'
import { useAuth } from '@/components/auth/SessionProvider'
import Link from 'next/link'

interface AdminUser {
    id: string
    email?: string
    is_super_admin: boolean
    max_weddings: number
    created_at: string
    Wedding: { id: string; partner1Name: string; partner2Name: string }[]
}

export default function SuperAdminDashboard() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState<string | null>(null)
    const { user: authUser, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login')
        }
    }, [authUser, authLoading, router])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await authFetch('/api/admin/users')
            if (res.status === 401 || res.status === 403) {
                toast.error('Acesso Negado. Você não é um Super Admin.')
                router.push('/projects')
                return
            }
            const data = await res.json()
            if (data.success) {
                setUsers(data.data)
            } else {
                toast.error(data.error || 'Erro ao carregar usuários')
            }
        } catch {
            toast.error('Gatilho de segurança ativado. Falha na conexão.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (authUser) {
            fetchUsers()
        }
    }, [authUser])

    const handleUpdateCredits = async (userId: string, currentCredits: number, addition: number) => {
        const newMax = currentCredits + addition
        if (newMax < 0) return

        setIsProcessing(userId)
        try {
            const res = await authFetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, max_weddings: newMax })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Créditos atualizados para ${newMax}!`)
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, max_weddings: newMax } : u))
            } else {
                toast.error(data.error || 'Erro ao atualizar créditos')
            }
        } catch {
            toast.error('Erro de conexão ao atualizar créditos')
        }
        setIsProcessing(null)
    }

    const handleDeleteAccount = async (userId: string) => {
        const confirmDelete = prompt('PERIGO: Para deletar esta conta e todos os seus casamentos associados, digite "DELETAR CONSTELACAO":')
        if (confirmDelete !== 'DELETAR CONSTELACAO') {
            toast.error('Exclusão cancelada pela trava de segurança.')
            return
        }

        setIsProcessing(userId)
        try {
            const res = await authFetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Usuário banido e dados removidos permanentemente.')
                setUsers(prev => prev.filter(u => u.id !== userId))
            } else {
                toast.error(data.error || 'Erro ao deletar usuário')
            }
        } catch {
            toast.error('Erro de conexão ao deletar usuário')
        }
        setIsProcessing(null)
    }

    if (authLoading || isLoading) return (
        <div className="flex min-h-screen items-center justify-center bg-emerald-950">
            <div className="flex flex-col items-center">
                <ShieldAlert className="w-12 h-12 text-emerald-400 animate-pulse mb-4" />
                <div className="text-emerald-300 font-medium">Validando Tokens de Alta Segurança...</div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-xl">
                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                Painel Master SaaS
                                <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Root</span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Gestão de assinantes, clientes e infraestrutura do Marryflow.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="text-slate-600 border-slate-200" onClick={fetchUsers}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Atualizar Dados
                        </Button>
                        <Link href="/projects">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Acessar Meus Eventos
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Global Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
                        <div className="bg-blue-50 p-4 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total de Assessores</p>
                            <h3 className="text-3xl font-bold text-slate-800">{users.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
                        <div className="bg-emerald-50 p-4 rounded-full">
                            <Heart className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Casamentos Criados</p>
                            <h3 className="text-3xl font-bold text-slate-800">
                                {users.reduce((acc, user) => acc + (user.Wedding?.length || 0), 0)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
                        <div className="bg-emerald-50 p-4 rounded-full">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Integridade da Plataforma</p>
                            <h3 className="text-lg font-bold text-emerald-600">Serviços Online</h3>
                        </div>
                    </div>
                </div>

                {/* CRM / User Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-emerald-500" />
                            Clientes Cadastrados
                        </h2>
                        <Input placeholder="Buscar por email..." className="max-w-xs border-slate-200" disabled />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Usuário / ID</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-center">Uso de Eventos</th>
                                    <th className="px-6 py-4 text-center">Permissão/Limite (Quotas)</th>
                                    <th className="px-6 py-4 text-right">Ação Destrutiva</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => {
                                    const activeCount = u.Wedding?.length || 0
                                    const isLimitReached = activeCount >= u.max_weddings
                                    return (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-800">{u.email || 'Email Privado API'}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{u.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_super_admin ? (
                                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">Super Admin</span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">Assessor (Client)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-sm font-bold ${isLimitReached ? 'text-orange-500' : 'text-emerald-600'}`}>
                                                        {activeCount} / {u.max_weddings}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 uppercase mt-1">Casamentos</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() => handleUpdateCredits(u.id, u.max_weddings, -1)}
                                                        disabled={isProcessing === u.id || u.max_weddings <= 1}
                                                    >
                                                        -
                                                    </Button>
                                                    <div className="bg-slate-100 px-3 py-1 rounded-lg font-mono text-sm min-w-12 text-center font-medium">
                                                        {isProcessing === u.id ? '...' : u.max_weddings}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                        onClick={() => handleUpdateCredits(u.id, u.max_weddings, 1)}
                                                        disabled={isProcessing === u.id}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteAccount(u.id)}
                                                    disabled={isProcessing === u.id || u.is_super_admin}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Banir Infra
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    )
                                })}

                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum usuário encontrado no sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
