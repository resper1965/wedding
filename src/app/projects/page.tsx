'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, AlertCircle, Heart } from 'lucide-react'
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
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            authFetch('/api/wedding')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        // Em nossa API atualizada, retorna um array de casamentos
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
                    partner2Name: 'Casamento',
                    weddingDate: new Date().toISOString()
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                if (res.status === 403) {
                    setErrorMessage(data.error || 'Limite de casamentos atingido.')
                    setShowLimitModal(true)
                } else {
                    alert('Erro ao criar projeto.')
                }
            } else {
                // Sucesso, adiciona na tela
                setProjects(prev => [...prev, data.data])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsCreating(false)
        }
    }

    if (loading || isFetching) return <div className="p-8 text-center text-stone-500">Carregando seus projetos...</div>

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-5xl mx-auto">

                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">Meus Casamentos</h1>
                        <p className="text-stone-500 mt-1">Gerencie seus projetos e clientes.</p>
                    </div>
                    <button
                        onClick={handleCreateProject}
                        disabled={isCreating}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors"
                    >
                        {isCreating ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Plus className="w-5 h-5" />}
                        Novo Projeto
                    </button>
                </header>

                {/* Modal de Limite (Gating) */}
                {showLimitModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-8 flex gap-4 items-start shadow-sm"
                    >
                        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-rose-900">Ação Bloqueada</h3>
                            <p className="text-rose-700 mt-1">{errorMessage}</p>
                            <div className="mt-4 flex gap-3">
                                <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                    Falar com Suporte (Upsell)
                                </a>
                                <button onClick={() => setShowLimitModal(false)} className="text-rose-700 hover:bg-rose-100 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Lista de Casamentos */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                    <Heart className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-2 mb-1">
                                {project.partner1Name} <span className="text-amber-500">&amp;</span> {project.partner2Name}
                            </h3>
                            <p className="text-sm text-stone-500 mb-6 font-mono text-xs truncate">
                                ID: {project.id.slice(0, 8)}...
                            </p>

                            <button
                                onClick={() => router.push(`/?tenantId=${project.id}`)}
                                className="w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2 rounded-lg transition-colors text-sm"
                            >
                                Acessar Painel
                            </button>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="sm:col-span-2 lg:col-span-3 text-center py-20 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50">
                            <h3 className="text-lg font-medium text-stone-600">Nenhum projeto encontrado</h3>
                            <p className="text-stone-400 mt-2 mb-6">Comece criando o seu primeiro casamento.</p>
                            <button onClick={handleCreateProject} className="text-amber-600 font-medium hover:underline">
                                Criar Primeiro Projeto
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
