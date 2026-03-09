'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Bot, Star, Sparkles, CheckCircle2, HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui-custom/BrandLogo'
import { PublicFooter } from '@/components/public/PublicFooter'
import { MasterHeader } from '@/components/public/MasterHeader'

import { useAuth } from '@/components/auth/SessionProvider'

export default function MarketingLandingPage() {
    const { user, loading } = useAuth()

    const features = [
        {
            title: "Gabi: Concierge 24h",
            description: "Uma assistente amigável no WhatsApp que responde às dúvidas dos convidados sobre dress code, local e logística.",
            icon: <Sparkles className="w-6 h-6 text-primary" />
        },
        {
            title: "O Ponto de Paz da Assessoria",
            description: "Diga adeus às dezenas de planilhas. Organize cronogramas, fornecedores e checklists de múltiplos casais em um único painel elegante.",
            icon: <Star className="w-6 h-6 text-primary" />
        },
        {
            title: "RSVP Sem Estresse",
            description: "Chega de implorar por confirmações! Gerenciamento automatizado de convidados conectado diretamente à montagem das mesas.",
            icon: <CheckCircle2 className="w-6 h-6 text-primary" />
        }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
            <title>MarryFlow — O Seu Casamento Perfeito</title>
            <meta name="description" content="A plataforma definitiva que une cerimonialistas e noivos com Gabi, a sua IA." />
            <meta property="og:title" content="MarryFlow — O Seu Casamento Perfeito" />
            <meta property="og:description" content="A plataforma definitiva que une cerimonialistas e noivos com Gabi, a sua IA." />

            {/* Navigation Unificada */}
            <MasterHeader type="landing" />

            <main id="main" className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-6">

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted text-muted-foreground text-[10px] tracking-wide uppercase font-bold mb-8 soft-shadow">
                            <Sparkles className="w-4 h-4" />
                            <span>Para Organizações Exigentes</span>
                        </div>

                        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight text-foreground mb-8 leading-tight flex flex-wrap justify-center items-baseline gap-x-3">
                            <span>A Jornada até o Casamento Perfeito</span>
                            <span className="block sm:inline">Começa no <BrandLogo size="hero" link={false} className="inline-flex" /></span>
                        </h1>

                        <p className="max-w-[65ch] mx-auto text-lg sm:text-xl text-foreground/70 mb-10 leading-relaxed font-medium">
                            A plataforma definitiva que une assessores e o casal. O <strong>MarryFlow</strong><span className="text-[var(--brand-dot)]">.</span> conta com a <strong>Gabi</strong>, uma Inteligência Artificial exclusiva que responde às dúvidas dos convidados no WhatsApp, para que você foque no que realmente importa: celebrar o amor.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link
                                href={user ? "/projects" : "/login"}
                                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-lg font-bold px-10 py-4 rounded-full transition-all soft-shadow-hover hover:-translate-y-0.5"
                            >
                                {user ? "Acessar Meus Eventos" : "Criar Meu Evento Agora"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* TRUST SECTION: Social Proof */}
                        <div className="pt-8 border-t border-border w-full max-w-3xl mx-auto flex flex-col items-center">
                            <p className="text-xs text-muted-foreground font-bold mb-4 uppercase tracking-widest">Escolhida para mais de 10,000+ Casamentos por</p>
                            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                                <span className="text-xl font-serif text-foreground/80">Revista Inesquecível</span>
                                <span className="text-xl font-serif text-foreground/80">Lápis de Noiva</span>
                                <span className="text-xl font-serif text-foreground/80">CZ Casamentos</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mt-24 grid sm:grid-cols-3 gap-8 text-left"
                    >
                        {features.map((feat, idx) => (
                            <div key={idx} className="p-8 rounded-[2rem] border border-border bg-muted/60 backdrop-blur-xl hover:bg-muted/80 transition-all soft-shadow hover:soft-shadow-hover">
                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6 text-primary">
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{feat.title}</h3>
                                <p className="text-foreground/70 font-medium leading-relaxed max-w-[45ch]">{feat.description}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
