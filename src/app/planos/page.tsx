'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight, Building, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingPage() {
    const plans = [
        {
            name: "1 Casamento",
            description: "Para casais organizando seu próprio evento.",
            price: "R$ 480",
            period: "por ano",
            renew: "Renovação por R$ 240/ano adicional",
            savings: "",
            features: [
                "Concierge de WhatsApp 24h",
                "RSVP Ilimitado",
                "Gestão de Presentes",
                "Painel Administrativo",
                "Suporte por Email"
            ],
            cta: "Começar Agora",
            href: "/login",
            popular: false,
        },
        {
            name: "5 Casamentos",
            description: "Para assessores iniciantes e cerimonialistas.",
            price: "R$ 1.990",
            period: "por ano",
            renew: "Renovação por R$ 990/ano (R$ 198/evento)",
            savings: "Economia de 17% (R$ 398 por evento)",
            features: [
                "Tudo do plano 1 Casamento",
                "Contas de Membros (Equipe)",
                "Relatórios Unificados",
                "Suporte Prioritário",
                "Onboarding Personalizado"
            ],
            cta: "Assinar Plano 5",
            href: "/login",
            popular: true,
        },
        {
            name: "10 Casamentos",
            description: "Ideal para grandes assessorias.",
            price: "R$ 3.490",
            period: "por ano",
            renew: "Renovação por R$ 1.690/ano (R$ 169/evento)",
            savings: "Economia de 27% (R$ 349 por evento)",
            features: [
                "Tudo do plano 5 Casamentos",
                "API de Integração",
                "Webhook de Eventos",
                "Gerente de Conta Dedicado",
                "Treinamento de Equipe"
            ],
            cta: "Assinar Plano 10",
            href: "/login",
            popular: false,
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30">

            {/* Navbar */}
            <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur-md border-b border-white/10 bg-slate-950/60">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-white">
                            Wedding<span className="text-amber-500">App</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Entrar
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 relative">
                {/* Glow Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight text-white mb-6 leading-tight"
                        >
                            Preços Transparentes,<br />
                            <span className="font-serif italic font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                                Sem Surpresas.
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-400 mx-auto max-w-prose"
                        >
                            Escolha o plano ideal para você ou sua assessoria. Aproveite a economia em escala para múltiplos eventos.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15 }}
                                className={`relative rounded-3xl overflow-hidden border ${plan.popular ? 'border-amber-500/50 shadow-2xl shadow-amber-500/10' : 'border-white/10'} bg-slate-900/50 backdrop-blur-xl flex flex-col h-full`}
                            >
                                {plan.popular && (
                                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider py-1.5 text-center">
                                        Mais Escolhido
                                    </div>
                                )}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 h-10">{plan.description}</p>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                            <span className="text-slate-400">{plan.period}</span>
                                        </div>
                                        <p className="text-amber-400/80 text-sm mt-2 font-medium">{plan.renew}</p>
                                        {plan.savings && (
                                            <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                                                {plan.savings}
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                                <span className="text-slate-300 text-sm">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button asChild className={`w-full h-12 rounded-xl text-base font-medium transition-colors ${plan.popular ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                        <Link href={plan.href}>
                                            {plan.cta}
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Enterprise / Corporate Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-20 max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left"
                    >
                        <div>
                            <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
                                <Building className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Trabalha com muito mais do que 10 noivas?</h3>
                            <p className="text-slate-400 max-w-lg">
                                Para estúdios de assessoria e cerimonialistas consolidados. Oferecemos pacotes ilimitados, White-label completo, descontos ainda maiores em escala e infraestrutura dedicada.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="shrink-0 h-12 px-8 rounded-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300">
                            <Link href="mailto:resper@ness.com.br" className="flex items-center gap-2">
                                Falar com Consultor
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </motion.div>

                </div>
            </main>
        </div>
    )
}
