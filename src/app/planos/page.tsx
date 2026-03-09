'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight, Building, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterHeader } from '@/components/public/MasterHeader'
import { PublicFooter } from '@/components/public/PublicFooter'

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
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">

            <MasterHeader type="landing" />

            <main className="pt-32 pb-24 px-6 relative">
                {/* Glow Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight text-foreground mb-6 leading-tight"
                        >
                            Preços Transparentes,<br />
                            <span className="font-serif italic font-light text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                Sem Surpresas.
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-foreground/60 mx-auto max-w-prose font-medium"
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
                                className={`relative rounded-3xl overflow-hidden border ${plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-border/50'} bg-card/60 soft-shadow backdrop-blur-xl flex flex-col h-full hover:soft-shadow-hover transition-all group`}
                            >
                                {plan.popular && (
                                    <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-2 text-center">
                                        Mais Escolhido
                                    </div>
                                )}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                    <p className="text-foreground/50 text-sm mb-6 h-10 font-medium">{plan.description}</p>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                                            <span className="text-foreground/40 text-sm">{plan.period}</span>
                                        </div>
                                        <p className="text-warning text-sm mt-2 font-bold">{plan.renew}</p>
                                        {plan.savings && (
                                            <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide rounded-full border border-primary/20">
                                                {plan.savings}
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-primary shrink-0" />
                                                <span className="text-foreground/70 text-sm font-medium">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button asChild className={`w-full h-12 rounded-xl text-base font-bold transition-all ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
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
                        className="mt-20 max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] p-8 sm:p-12 border border-primary/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left"
                    >
                        <div>
                            <div className="inline-flex items-center justify-center p-4 bg-card/10 rounded-2xl mb-6">
                                <Building className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Escritório ou Grande Assessoria?</h3>
                            <p className="text-white/80 max-w-lg font-medium">
                                Para estúdios consolidadores. Oferecemos White-label completo, descontos agressivos em escala e infraestrutura dedicada para múltiplos casais.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="shrink-0 h-14 px-10 rounded-full border-white/20 bg-card/10 text-white hover:bg-card hover:text-primary font-bold transition-all shadow-xl">
                            <Link href="mailto:resper@ness.com.br" className="flex items-center gap-2">
                                Falar com Consultor
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
