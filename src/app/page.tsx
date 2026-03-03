'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Bot, Star, Sparkles, CheckCircle2, HeartHandshake } from 'lucide-react'
import Link from 'next/link'

export default function MarketingLandingPage() {
    const features = [
        {
            title: "Concierge Inteligente 24h",
            description: "Um assistente amigável no WhatsApp que responde às dúvidas dos convidados sobre dress code, local e presentes.",
            icon: <Bot className="w-6 h-6 text-amber-500" />
        },
        {
            title: "O Ponto de Paz da Assessoria",
            description: "Diga adeus às dezenas de planilhas. Organize cronogramas, fornecedores e checklists de múltiplos casais em um único painel elegante.",
            icon: <Star className="w-6 h-6 text-amber-500" />
        },
        {
            title: "RSVP Sem Estresse",
            description: "Chega de implorar por confirmações! Gerenciamento automatizado de convidados conectado diretamente à montagem das mesas.",
            icon: <CheckCircle2 className="w-6 h-6 text-amber-500" />
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-amber-500/30">

            {/* Navbar Minimalista */}
            <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur-md border-b border-white/10 bg-slate-950/60">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <HeartHandshake className="w-8 h-8 text-amber-500" />
                        <span className="text-xl font-bold tracking-tight text-white">
                            Wedding<span className="text-amber-500">App</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Entrar
                        </Link>
                        <Link
                            href="/projects"
                            className="text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-full transition-all"
                        >
                            Acessar Painel
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-6">

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            <span>Para Noivos e Cerimonialistas Exigentes</span>
                        </div>

                        {/* Tipografia Fluida (Clamp) e Tracking Ajustado para não sufocar letras */}
                        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight text-white mb-8 leading-tight">
                            A Jornada até o <span className="font-serif italic font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Casamento</span> Perfeito<br />
                            Sem o Estresse da Organização
                        </h1>

                        {/* Limite de Char/Linha: max-w-[65ch] ou max-w-prose + Line height */}
                        <p className="max-w-[65ch] mx-auto text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed">
                            A plataforma definitiva que une cerimonialistas e noivos. Nossa Inteligência Artificial responde às dúvidas dos convidados, para que você foque no que realmente importa: celebrar o amor.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-lg font-semibold px-8 py-4 rounded-full transition-all shadow-lg shadow-amber-500/25"
                            >
                                Comece Agora Gratuitamente
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* TRUST SECTION: Social Proof */}
                        <div className="pt-8 border-t border-white/10 w-full max-w-3xl mx-auto flex flex-col items-center">
                            <p className="text-sm text-slate-500 font-medium mb-4 uppercase tracking-wider">Escolhida para mais de 10,000+ Casamentos por</p>
                            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                                <span className="text-lg font-serif italic text-white/80">Revista Inesquecível</span>
                                <span className="text-lg font-serif italic text-white/80">Lápis de Noiva</span>
                                <span className="text-lg font-serif italic text-white/80">CZ Casamentos</span>
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
                            <div key={idx} className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{feat.title}</h3>
                                <p className="text-slate-400 leading-relaxed max-w-[45ch]">{feat.description}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>

        </div>
    )
}
