'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, MapPin, Calendar, Heart, Globe, Check } from 'lucide-react'

interface OnboardingWizardProps {
    weddingId: string
    onComplete: () => void
    onSaveStep: (data: Record<string, unknown>) => Promise<void>
}

const SITE_PAGES_OPTIONS = [
    { key: 'rsvp', label: 'Confirmação (RSVP)', default: true },
    { key: 'historia', label: 'Nossa História', default: true },
    { key: 'eventos', label: 'Programação', default: true },
    { key: 'padrinhos', label: 'Padrinhos', default: false },
    { key: 'hospedagem', label: 'Hospedagem', default: false },
    { key: 'fotos', label: 'Galeria de Fotos', default: false },
    { key: 'info', label: 'Informações', default: true },
]

export function OnboardingWizard({ weddingId, onComplete, onSaveStep }: OnboardingWizardProps) {
    const [step, setStep] = useState(0)
    const [isSaving, setIsSaving] = useState(false)

    // Step 1 data
    const [partner1, setPartner1] = useState('')
    const [partner2, setPartner2] = useState('')
    const [weddingDate, setWeddingDate] = useState('')
    const [venue, setVenue] = useState('')

    // Step 2 data
    const [sitePages, setSitePages] = useState<Record<string, boolean>>(
        Object.fromEntries(SITE_PAGES_OPTIONS.map(p => [p.key, p.default]))
    )

    const togglePage = (key: string) => {
        setSitePages(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleNext = async () => {
        if (step === 0) {
            if (!partner1 || !partner2) return
            setIsSaving(true)
            await onSaveStep({
                partner1Name: partner1,
                partner2Name: partner2,
                weddingDate: weddingDate || undefined,
                venue: venue || undefined,
            })
            setIsSaving(false)
            setStep(1)
        } else {
            setIsSaving(true)
            await onSaveStep({ site_pages: sitePages })
            setIsSaving(false)
            onComplete()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
            >
                {/* Progress bar */}
                <div className="h-1 bg-muted">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: step === 0 ? '50%' : '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="p-8">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs font-medium text-muted-foreground">
                            Passo {step + 1} de 2
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 0 ? (
                            <motion.div
                                key="step-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-serif font-medium text-foreground">
                                        Quem são os noivos?
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Vamos personalizar tudo para vocês.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-foreground/60 mb-1.5 block">Noivo(a) 1</label>
                                        <input
                                            value={partner1}
                                            onChange={e => setPartner1(e.target.value)}
                                            placeholder="Nome"
                                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground/60 mb-1.5 block">Noivo(a) 2</label>
                                        <input
                                            value={partner2}
                                            onChange={e => setPartner2(e.target.value)}
                                            placeholder="Nome"
                                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-foreground/60 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" /> Data do casamento
                                    </label>
                                    <input
                                        type="date"
                                        value={weddingDate}
                                        onChange={e => setWeddingDate(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-foreground/60 mb-1.5 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" /> Local <span className="text-muted-foreground/40">(opcional)</span>
                                    </label>
                                    <input
                                        value={venue}
                                        onChange={e => setVenue(e.target.value)}
                                        placeholder="Ex: Fazenda Vila Rica"
                                        className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-serif font-medium text-foreground flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-primary" />
                                        Seu site de casamento
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Escolha quais páginas seus convidados vão ver.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {SITE_PAGES_OPTIONS.map(page => (
                                        <button
                                            key={page.key}
                                            onClick={() => togglePage(page.key)}
                                            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all ${sitePages[page.key]
                                                    ? 'bg-primary/10 border border-primary/20 text-foreground'
                                                    : 'bg-muted/30 border border-transparent text-muted-foreground'
                                                }`}
                                        >
                                            <span className="font-medium">{page.label}</span>
                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${sitePages[page.key] ? 'bg-primary text-white' : 'bg-muted-foreground/20'
                                                }`}>
                                                {sitePages[page.key] && <Check className="h-3 w-3" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <p className="text-xs text-muted-foreground/60">
                                    Você pode mudar isso depois em <strong>Meu Site</strong>.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                        {step > 0 ? (
                            <button
                                onClick={() => setStep(0)}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> Voltar
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={handleNext}
                            disabled={isSaving || (step === 0 && (!partner1 || !partner2))}
                            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <span className="animate-pulse">Salvando...</span>
                            ) : step === 0 ? (
                                <>Próximo <ArrowRight className="h-4 w-4" /></>
                            ) : (
                                <>Começar <Heart className="h-4 w-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
