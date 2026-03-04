'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('marryflow-cookie-consent')
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('marryflow-cookie-consent', 'accepted')
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem('marryflow-cookie-consent', 'declined')
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-50 flex items-center justify-center pointer-events-none"
                >
                    <div className="glass-card max-w-3xl w-full p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 pointer-events-auto border-primary/20 shadow-2xl rounded-[2rem]">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-serif font-bold text-foreground mb-1">Privacidade Executiva</h3>
                            <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                                Utilizamos cookies e tecnologias avançadas para personalizar sua experiência de concierge.
                                Ao continuar, você concorda com nossos padrões de excelência em segurança e privacidade
                                (**ISO 27001**, **GDPR** e **LGPD**). Leia nossa <Link href="/privacy" className="text-primary hover:underline font-medium">Política de Privacidade</Link>.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDecline}
                                className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/5 rounded-xl"
                            >
                                Configurar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAccept}
                                className="bg-primary text-primary-foreground text-[10px] font-accent font-bold uppercase tracking-widest px-8 hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
                            >
                                Aceitar & Prosseguir
                            </Button>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setIsVisible(false);
                                }
                            }}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-primary/5 text-muted-foreground/30 transition-colors"
                            aria-label="Fechar aviso de privacidade"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
