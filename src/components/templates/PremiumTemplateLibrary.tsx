'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles, Star, Palette, Layout, Copy, Check, Info,
    Search, Filter, ExternalLink, Brush, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PremiumTemplate {
    id: string
    name: string
    type: string
    description: string
    category: 'Classic' | 'Modern' | 'Boho'
    content: string
    thumbnail: string
}

interface PremiumTemplateLibraryProps {
    onImportSuccess?: () => void
}

export function PremiumTemplateLibrary({ onImportSuccess }: PremiumTemplateLibraryProps) {
    const [templates, setTemplates] = useState<PremiumTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<string>('all')
    const [importingId, setImportingId] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/templates/premium')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTemplates(data.templates)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const handleImport = async (template: PremiumTemplate) => {
        setImportingId(template.id)
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: template.name,
                    type: template.type,
                    content: template.content,
                    variables: JSON.stringify(['firstName', 'partner1', 'partner2', 'date', 'venue', 'rsvpLink', 'weddingLink']),
                    isActive: true
                })
            })

            const data = await response.json()
            if (data.success) {
                toast.success(`Template "${template.name}" importado com sucesso!`)
                onImportSuccess?.()
            } else {
                toast.error('Erro ao importar template')
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor')
        } finally {
            setImportingId(null)
        }
    }

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === 'all' || t.category === category
        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-12 text-white soft-shadow">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="h-32 w-32" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <Badge className="mb-4 bg-card/20 text-white border-white/10 font-accent font-bold uppercase tracking-widest px-4 py-1">
                        Premium Library
                    </Badge>
                    <h2 className="text-4xl font-serif font-bold mb-4">Templates de Elite para o seu Casamento</h2>
                    <p className="text-lg text-white/70 font-medium leading-relaxed">
                        Uma curadoria exclusiva de estilos visuais e mensagens profissionais. Importe para sua galeria e comece a encantar seus convidados com um único clique.
                    </p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
                <div className="flex flex-1 items-center gap-3 max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                        <Input
                            placeholder="Buscar estilos ou categorias..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 rounded-2xl border-primary/10 bg-card focus:border-primary/30 transition-all font-sans"
                        />
                    </div>
                    <div className="flex p-1 bg-primary/5 rounded-2xl border border-primary/5">
                        {['all', 'Classic', 'Modern', 'Boho'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-accent font-bold uppercase tracking-widest transition-all",
                                    category === cat ? "bg-card text-primary shadow-sm" : "text-muted-foreground/40 hover:text-primary"
                                )}
                            >
                                {cat === 'all' ? 'Ver Todos' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-96 w-full animate-pulse rounded-[2rem] bg-primary/5" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredTemplates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                layout
                            >
                                <Card className="group overflow-hidden rounded-[2rem] border-primary/5 bg-card hover:border-primary/20 hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                                    {/* Visual Preview */}
                                    <div className={cn(
                                        "h-48 relative overflow-hidden flex items-center justify-center pt-8 px-8",
                                        template.category === 'Classic' && "bg-gradient-to-br from-stone-100 to-stone-50",
                                        template.category === 'Modern' && "bg-gradient-to-br from-slate-100 to-slate-50",
                                        template.category === 'Boho' && "bg-gradient-to-br from-amber-50 to-orange-50",
                                    )}>
                                        {/* Simplified UI preview */}
                                        <div className="w-full bg-card rounded-t-2xl shadow-xl p-4 border border-black/[0.03] space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="flex gap-1">
                                                <div className="h-1.5 w-8 bg-primary/20 rounded" />
                                                <div className="h-1.5 w-12 bg-primary/10 rounded" />
                                            </div>
                                            <div className="h-3 w-3/4 bg-primary/30 rounded" />
                                            <div className="h-2 w-full bg-primary/5 rounded" />
                                            <div className="h-2 w-full bg-primary/5 rounded" />
                                            <div className="h-8 w-full bg-primary/10 rounded-lg mt-4" />
                                        </div>

                                        {/* Badge */}
                                        <Badge className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm text-primary border-primary/10">
                                            {template.category}
                                        </Badge>
                                    </div>

                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                                            {template.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                                            {template.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="px-8 pb-8 flex-1">
                                        <div className="rounded-2xl bg-primary/[0.01] border border-primary/5 p-4 relative overflow-hidden">
                                            <p className="text-[11px] font-medium text-muted-foreground/40 leading-relaxed italic line-clamp-4">
                                                {template.content.replace(/\{(\w+)\}/g, '$1').substring(0, 150)}...
                                            </p>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-8 pt-0 flex gap-2">
                                        <Button
                                            className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-accent font-bold uppercase tracking-widest text-[10px] h-11"
                                            onClick={() => handleSelect(template)}
                                        >
                                            <Layout className="mr-2 h-4 w-4" /> Visualizar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px] h-11"
                                            onClick={() => handleImport(template)}
                                            disabled={importingId === template.id}
                                        >
                                            {importingId === template.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredTemplates.length === 0 && (
                <div className="p-24 text-center">
                    <Brush className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                    <h3 className="text-xl font-serif font-bold text-foreground">Nenhum estilo encontrado</h3>
                    <p className="text-sm text-muted-foreground/40 mt-1">Tente ajustar seus filtros de busca.</p>
                </div>
            )}
        </div>
    )

    function handleSelect(template: PremiumTemplate) {
        toast.info(`Visualização de "${template.name}" em breve!`)
    }
}
