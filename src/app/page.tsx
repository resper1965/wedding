'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Bot, Star, Sparkles, CheckCircle2, HeartHandshake } from 'lucide-react'
import Link from 'next/link'

export default function MarketingLandingPage() {
    const features = [
        {
            title: "Inteligência Artificial (Concierge)",
            description: "Um assistente que tira dúvidas dos seus convidados 24/7 via WhatsApp sobre dress code, local e muito mais.",
            icon: <Bot className="w-6 h-6 text-amber-500" />
        },
        {
            title: "Gestão Multi-Casais (SaaS)",
            description: "Plataforma escalável para Assessorias e Cerimonialistas organizarem múltiplos casamentos num único painel.",
            icon: <Star className="w-6 h-6 text-amber-500" />
        },
        {
            title: "Confirmação Automática (RSVP)",
            description: "Adeus planilhas! RSVP tracking instantâneo que se conecta direto à lista de convidados e tabelas de assentos.",
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
                            Wedding<span className="text-amber-500">SaaS</span>
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
                            <span>A Revolução 2.0 da Assessoria</span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
                            Organize <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Casamentos</span><br />
                            Com o Poder da Inteligência Artificial
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed">
                            O primeiro sistema operacional de casamentos Multi-Tenant com um microserviço de AI autônomo acoplado via WhatsApp. Ideal para Cerimonialistas.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-lg font-semibold px-8 py-4 rounded-full transition-all shadow-lg shadow-amber-500/25"
                            >
                                Criar Primeiro Projeto
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
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
                                <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feat.description}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>

        </div>
    )
}
