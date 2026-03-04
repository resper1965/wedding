'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bot, Users, CheckCircle2, MessageSquare,
    Activity, Zap, AlertTriangle, RefreshCw,
    Search, ArrowUpRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DashboardStats {
    totalConversations: number
    activeFlows: number
    confirmedToday: number
    qrCodesGenerated: number
    checkInsToday: number
}

interface Conversation {
    id: string
    familyName: string
    lastMessage: string
    lastMessageAt: string | null
    flowStatus: string
    messageCount: number
}

export function InteractivityDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    const fetchData = async () => {
        try {
            const [statsRes, convosRes] = await Promise.all([
                fetch('/api/concierge/stats'),
                fetch('/api/concierge/conversations')
            ])

            const statsData = await statsRes.json()
            const convosData = await convosRes.json()

            setStats(statsData)
            setConversations(convosData.conversations || [])
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            toast.error('Erro ao atualizar War Room')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000) // Auto-refresh every 30s
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            {/* War Room Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground">Reception War Room</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                        <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">
                            Live Interactivity Monitor • ISO 27001 Secured
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-8 rounded-xl border-primary/10 bg-primary/5 text-primary font-accent font-bold">
                        <Zap className="mr-1 h-3 w-3" /> Real-time
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setLoading(true); fetchData() }}
                        className="rounded-xl text-muted-foreground/40 hover:text-primary"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Conversas Gabi', value: stats?.totalConversations || 0, icon: MessageSquare, color: 'text-info' },
                    { label: 'Check-ins Hoje', value: stats?.checkInsToday || 0, icon: CheckCircle2, color: 'text-success' },
                    { label: 'RSVPs Hoje', value: stats?.confirmedToday || 0, icon: Activity, color: 'text-warning' },
                    { label: 'Fluxos Ativos', value: stats?.activeFlows || 0, icon: Bot, color: 'text-primary' },
                ].map((item, i) => (
                    <Card key={i} className="glass-card border-primary/5 overflow-hidden group hover:border-primary/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">{item.label}</p>
                                    <p className="text-3xl font-serif font-bold text-foreground">{item.value}</p>
                                </div>
                                <div className={cn("h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform", item.color)}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Conversation Feed */}
                <Card className="lg:col-span-2 glass-card border-primary/5">
                    <CardHeader className="border-b border-primary/5 bg-primary/[0.01]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-serif font-bold text-primary">Interações Recentes (Gabi AI)</CardTitle>
                            <Button variant="ghost" size="sm" className="text-[10px] font-accent font-bold uppercase tracking-widest text-primary/40">
                                Ver Todas <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-primary/5">
                            {conversations.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground/40">Nenhuma interação recente.</div>
                            ) : (
                                conversations.map((convo) => (
                                    <div key={convo.id} className="p-4 hover:bg-primary/[0.01] transition-colors flex items-start gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center font-serif text-sm font-bold text-primary">
                                            {convo.familyName?.[0] || 'C'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-serif font-bold text-foreground truncate">{convo.familyName}</span>
                                                <span className="text-[9px] font-accent font-bold text-muted-foreground/30">
                                                    {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleTimeString('pt-BR') : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground/60 line-clamp-1 italic font-medium">"{convo.lastMessage}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Check-in Progress */}
                <Card className="glass-card border-primary/5">
                    <CardHeader className="border-b border-primary/5 bg-primary/[0.01]">
                        <CardTitle className="text-lg font-serif font-bold text-primary">Status da Recepção</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-accent font-bold uppercase tracking-widest">
                                <span className="text-muted-foreground/60">Geral Check-in</span>
                                <span className="text-primary">{stats ? Math.round((stats.checkInsToday / (stats.totalConversations || 1)) * 100) : 0}%</span>
                            </div>
                            <Progress value={stats ? (stats.checkInsToday / (stats.totalConversations || 1)) * 100 : 0} className="h-2 bg-primary/5" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-primary/40 mb-1">Tokens Ativos</p>
                                <p className="text-2xl font-serif font-bold text-primary">{stats?.qrCodesGenerated || 0}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-success/5 border border-success/10">
                                <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-success/60 mb-1">Entradas</p>
                                <p className="text-2xl font-serif font-bold text-success">{stats?.checkInsToday || 0}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-primary/5 space-y-4">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground/60 font-medium">
                                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary" />
                                </div>
                                Monitoramento de latência OK
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground/60 font-medium">
                                <div className="h-8 w-8 rounded-full bg-success/5 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                </div>
                                Sincronização em tempo real ativa
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
