'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Globe, Eye, EyeOff, ExternalLink, Heart, Calendar,
    Users, Hotel, Camera, Info, FileText, Loader2
} from 'lucide-react'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { toast } from 'sonner'

const SITE_PAGES = [
    { key: 'rsvp', label: 'Confirmação (RSVP)', description: 'Convidados confirmam presença', icon: FileText },
    { key: 'historia', label: 'Nossa História', description: 'A história do casal', icon: Heart },
    { key: 'eventos', label: 'Programação', description: 'Cronograma e eventos do dia', icon: Calendar },
    { key: 'padrinhos', label: 'Padrinhos', description: 'Lista de padrinhos e madrinhas', icon: Users },
    { key: 'hospedagem', label: 'Hospedagem', description: 'Opções de hotéis e estadias', icon: Hotel },
    { key: 'fotos', label: 'Galeria de Fotos', description: 'Fotos do casal', icon: Camera },
    { key: 'info', label: 'Informações', description: 'Local, horário, dress code', icon: Info },
] as const

type SitePages = Record<string, boolean>

const DEFAULT_PAGES: SitePages = {
    rsvp: true,
    historia: true,
    eventos: true,
    padrinhos: true,
    hospedagem: true,
    fotos: true,
    info: true,
}

export default function MySiteManager() {
    const { tenantId } = useTenant()
    const [pages, setPages] = useState<SitePages>(DEFAULT_PAGES)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const fetchSitePages = useCallback(async () => {
        try {
            const res = await tenantFetch('/api/wedding', tenantId)
            const data = await res.json()
            if (data.success && data.data) {
                const wedding = Array.isArray(data.data) ? data.data[0] : data.data
                if (wedding?.site_pages) {
                    setPages({ ...DEFAULT_PAGES, ...wedding.site_pages })
                }
            }
        } catch (err) {
            console.error('Error fetching site pages:', err)
        }
        setIsLoading(false)
    }, [tenantId])

    useEffect(() => {
        fetchSitePages()
    }, [fetchSitePages])

    const togglePage = async (key: string) => {
        const newPages = { ...pages, [key]: !pages[key] }
        setPages(newPages)
        setIsSaving(true)

        try {
            const res = await tenantFetch('/api/wedding', tenantId, {
                method: 'PUT',
                body: JSON.stringify({ site_pages: newPages }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(newPages[key] ? 'Página publicada' : 'Página ocultada')
            } else {
                setPages(pages)
                toast.error('Erro ao salvar')
            }
        } catch {
            setPages(pages)
            toast.error('Erro de conexão')
        }
        setIsSaving(false)
    }

    const siteUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/evento/${tenantId}`
        : `/evento/${tenantId}`

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const activeCount = Object.values(pages).filter(Boolean).length

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-medium text-foreground">Meu Site</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {activeCount} de {SITE_PAGES.length} páginas ativas
                    </p>
                </div>
                <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-xs font-medium text-primary transition-all hover:bg-primary/20"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver meu site
                </a>
            </div>

            {/* URL card */}
            <div className="rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-sm">
                <p className="text-xs font-medium text-muted-foreground mb-2">Link do seu site</p>
                <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary shrink-0" />
                    <code className="text-sm text-foreground/80 truncate flex-1">{siteUrl}</code>
                    <button
                        onClick={() => { navigator.clipboard.writeText(siteUrl); toast.success('Link copiado!') }}
                        className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                        Copiar
                    </button>
                </div>
            </div>

            {/* Page toggles */}
            <div className="grid gap-3">
                {SITE_PAGES.map((page, i) => {
                    const Icon = page.icon
                    const isActive = pages[page.key] ?? true

                    return (
                        <motion.div
                            key={page.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${isActive
                                    ? 'border-primary/20 bg-card/60'
                                    : 'border-border/50 bg-card/20 opacity-60'
                                }`}
                        >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                }`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{page.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{page.description}</p>
                            </div>

                            {/* Preview button */}
                            {isActive && (
                                <a
                                    href={`${siteUrl}/${page.key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                    title="Ver como convidado"
                                >
                                    <Eye className="h-4 w-4" />
                                </a>
                            )}

                            {/* Toggle */}
                            <button
                                onClick={() => togglePage(page.key)}
                                disabled={isSaving}
                                className={`relative shrink-0 h-7 w-12 rounded-full transition-colors duration-200 ${isActive ? 'bg-primary' : 'bg-muted-foreground/20'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
