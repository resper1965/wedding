'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, AlertCircle, Heart, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/auth/SessionProvider'
import { authFetch } from '@/lib/auth-fetch'

type WeddingProject = {
    id: string
    partner1Name: string
    partner2Name: string
    weddingDate: string
}

export default function ProjectsDashboard() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<WeddingProject[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    // Paywall / Gating State
    const [showLimitModal, setShowLimitModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (!loading && user?.isSuperAdmin) {
            router.push('/admin/master')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            authFetch('/api/wedding')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        // In our updated API, it returns an array of weddings
                        setProjects(Array.isArray(data.data) ? data.data : [data.data])
                    }
                })
                .finally(() => setIsFetching(false))
        }
    }, [user])

    const handleCreateProject = async () => {
        setIsCreating(true)
        setShowLimitModal(false)
        setErrorMessage('')

        try {
            const res = await authFetch('/api/wedding', {
                method: 'POST',
                body: JSON.stringify({
                    partner1Name: 'Novo',
                    partner2Name: 'Evento',
                    weddingDate: new Date().toISOString()
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                if (res.status === 403) {
                    setErrorMessage(data.error || 'Limite de eventos atingido.')
                    setShowLimitModal(true)
                } else {
                    alert('Erro ao criar projeto.')
                }
            } else {
                setProjects(prev => [...prev, data.data])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Tem certeza que deseja apagar este projeto? Esta ação é irreversível.')) {
            return
        }

        try {
            const res = await authFetch('/api/wedding', {
                method: 'DELETE',
                headers: {
                    'x-tenant-id': projectId
                }
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                alert('Erro ao apagar projeto: ' + (data.error || 'Desconhecido'))
            } else {
                setProjects(prev => prev.filter(p => p.id !== projectId))
            }
        } catch (err) {
            console.error(err)
            alert('Erro ao apagar projeto.')
        }
    }

    if (loading || isFetching) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary mb-4" />
                <div className="text-primary/70 font-medium">Carregando seus projetos...</div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">

                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Meus Eventos</h1>
                        <p className="text-foreground/60 mt-2 font-medium">Gerencie suas celebrações e convidados.</p>
                    </div>
                    <button
                        onClick={handleCreateProject}
                        disabled={isCreating}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transform transition-all duration-300 font-accent font-bold uppercase tracking-widest text-[10px]"
                    >
                        {isCreating ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> : <Plus className="w-4 h-4" />}
                        Novo Projeto
                    </button>
                </header>

                {/* Limit Modal (Gating) */}
                {showLimitModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex gap-4 items-start shadow-sm"
                    >
                        <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-900">Ação Bloqueada</h3>
                            <p className="text-red-700 mt-1">{errorMessage}</p>
                            <div className="mt-5 flex gap-3">
                                <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                    Falar com Suporte (Upsell)
                                </a>
                                <button onClick={() => setShowLimitModal(false)} className="text-red-700 hover:bg-red-100 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Projects Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={project.id}
                            className="bg-card/40 border border-border/40 backdrop-blur-md rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:bg-card/60 transition-all duration-500 group flex flex-col h-full border-t-primary/10"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <Heart className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full tracking-wide">
                                        Ativo
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteProject(project.id)
                                        }}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Apagar Projeto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-serif font-medium text-foreground flex items-center gap-2 mb-2 line-clamp-2">
                                    {project.partner1Name} <span className="text-accent font-sans text-sm">&amp;</span> {project.partner2Name}
                                </h3>
                                <p className="text-sm text-foreground/50 mb-6 font-mono text-xs truncate bg-muted/50 inline-block px-2 py-1 rounded-md">
                                    ID: {project.id.slice(0, 8)}...
                                </p>
                            </div>

                            <button
                                onClick={() => router.push(`/dashboard?tenantId=${project.id}`)}
                                className="w-full text-center bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-accent font-bold uppercase tracking-widest py-3.5 rounded-2xl transition-all duration-300 text-[10px] shadow-sm active:scale-95"
                            >
                                Acessar Painel
                            </button>
                        </motion.div>
                    ))}

                    {projects.length === 0 && (
                        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-3xl bg-muted/50">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Heart className="w-8 h-8 text-border" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-serif text-foreground mb-2">Nenhum projeto encontrado</h3>
                            <p className="text-foreground/60 mt-1 mb-8">Comece criando a sua primeira celebração no Marryflow.</p>
                            <button
                                onClick={handleCreateProject}
                                className="bg-muted hover:bg-muted/80 text-primary px-6 py-2.5 rounded-xl font-medium transition-colors"
                            >
                                Criar Primeiro Projeto
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
