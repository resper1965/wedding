'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, Users, CreditCard, Trash2, UserPlus, RefreshCcw, Activity, ShieldCheck, Heart, Database, Wrench, FlaskConical } from 'lucide-react'
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
    const [isSeeding, setIsSeeding] = useState(false)
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

    const handleSeedDemo = async () => {
        if (!confirm('Deseja realmente resetar os dados do Casamento de Demonstração? Isso apagará 100 convidados e recriará o ambiente do zero.')) return

        setIsSeeding(true)
        try {
            const res = await authFetch('/api/admin/seed', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                toast.success('Ambiente de demonstração resetado com sucesso!')
                fetchUsers() // Refresh stats
            } else {
                toast.error(data.error || 'Erro ao processar seed')
            }
        } catch {
            toast.error('Falha na comunicação com o servidor de infraestrutura')
        } finally {
            setIsSeeding(false)
        }
    }

    if (authLoading || isLoading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center">
                <ShieldAlert className="h-12 w-12 animate-pulse mb-4 text-primary" />
                <div className="text-primary/70 font-medium">Validando Tokens de Alta Segurança...</div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background p-6 sm:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-8 rounded-[2rem]">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                Painel Master SaaS
                                <span className="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Root</span>
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Gestão de assinantes, clientes e infraestrutura do Marryflow.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-border text-foreground/70" onClick={fetchUsers}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Atualizar Dados
                        </Button>
                        <Link href="/projects">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Acessar Meus Eventos
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Global Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-8 rounded-[2rem] flex items-center gap-5">
                        <div className="bg-blue-500/10 p-4 rounded-full">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Total de Assessores</p>
                            <h3 className="text-3xl font-bold text-foreground">{users.length}</h3>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2rem] flex items-center gap-5">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Heart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Casamentos Criados</p>
                            <h3 className="text-3xl font-bold text-foreground">
                                {users.reduce((acc, user) => acc + (user.Wedding?.length || 0), 0)}
                            </h3>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2rem] flex items-center gap-5">
                        <div className="bg-success/10 p-4 rounded-full">
                            <Activity className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Integridade da Plataforma</p>
                            <h3 className="text-lg font-bold text-success">Serviços Online</h3>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 rounded-[2rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                                <Database className="w-5 h-5 text-primary" />
                                Ações de Infraestrutura
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6 max-w-md">
                                Ferramentas avançadas para gestão do ambiente, limpeza de caches e geração de dados sintéticos para demonstrações.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={handleSeedDemo}
                                    disabled={isSeeding}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
                                >
                                    <FlaskConical className={`w-4 h-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
                                    {isSeeding ? 'Gerando Demo...' : 'Resetar Casamento Demo'}
                                </Button>
                                <Button variant="outline" className="text-muted-foreground border-border" disabled>
                                    <Wrench className="w-4 h-4 mr-2" />
                                    Limpar Cache Global
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/10 backdrop-blur-xl p-8 rounded-[2rem] border border-primary/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-10" />
                        <div className="relative flex flex-col h-full justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                                    <ShieldAlert className="w-5 h-5 text-warning" />
                                    Terminal de Segurança
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Acesso restrito para auditoria de logs e verificações de integridade. Use com cautela.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button className="bg-background/40 hover:bg-background/60 text-foreground border border-border" onClick={() => toast.info('Acesso aos logs bloqueado por política de segurança.')}>
                                    <Activity className="w-4 h-4 mr-2" />
                                    Logs de Auditoria
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CRM / User Data Table */}
                <div className="glass-card rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Clientes Cadastrados
                        </h2>
                        <Input placeholder="Buscar por email..." className="max-w-xs border-border bg-background/40" disabled />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-muted-foreground">
                            <thead className="bg-primary/5 text-primary text-[10px] font-accent font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Usuário / ID</th>
                                    <th className="px-8 py-5">Papel / Acesso</th>
                                    <th className="px-8 py-5 text-center">Uso de Eventos</th>
                                    <th className="px-8 py-5 text-center">Permissão/Limite (Quotas)</th>
                                    <th className="px-8 py-5 text-right">Ação Destrutiva</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
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
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="font-medium text-foreground">{u.email || 'Email Privado API'}</div>
                                                <div className="text-[10px] text-muted-foreground/40 font-mono mt-0.5">{u.id}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {u.is_super_admin ? (
                                                    <span className="bg-primary/10 text-primary text-[10px] font-accent font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">Super Admin</span>
                                                ) : (
                                                    <span className="bg-muted text-muted-foreground text-[10px] font-accent font-bold px-3 py-1 rounded-full uppercase tracking-widest">Assessor</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-base font-bold ${isLimitReached ? 'text-warning' : 'text-primary'}`}>
                                                        {activeCount} / {u.max_weddings}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/40 font-accent font-bold uppercase tracking-widest mt-1">Casamentos</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border-border"
                                                        onClick={() => handleUpdateCredits(u.id, u.max_weddings, -1)}
                                                        disabled={isProcessing === u.id || u.max_weddings <= 1}
                                                    >
                                                        -
                                                    </Button>
                                                    <div className="bg-muted px-3 py-1 rounded-lg font-mono text-xs min-w-12 text-center font-bold text-foreground">
                                                        {isProcessing === u.id ? '...' : u.max_weddings}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border-primary/20 text-primary hover:bg-primary/5"
                                                        onClick={() => handleUpdateCredits(u.id, u.max_weddings, 1)}
                                                        disabled={isProcessing === u.id}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-error hover:text-error hover:bg-error/5 font-accent font-bold uppercase tracking-widest text-[10px]"
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
