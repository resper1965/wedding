'use client'

import { motion } from 'framer-motion'
import {
    ArrowRight, Bot, Sparkles, CheckCircle2,
    Globe, Users, Grid3X3, MessageSquare, CalendarHeart,
    ClipboardList, DollarSign, Briefcase, Gift,
    ScanLine, BarChart3, Zap, Settings, Heart
} from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui-custom/BrandLogo'
import { PublicFooter } from '@/components/public/PublicFooter'
import { MasterHeader } from '@/components/public/MasterHeader'
import { useAuth } from '@/components/auth/SessionProvider'

const FEATURE_GROUPS = [
    {
        title: 'Seu Site de Casamento',
        subtitle: 'Um site elegante e personalizável para seus convidados',
        icon: Globe,
        color: 'from-emerald-500/10 to-teal-500/10',
        features: [
            { icon: Globe, name: 'Site Personalizado', desc: 'Uma landing page única com a identidade do casal' },
            { icon: Heart, name: 'Páginas Opcionais', desc: 'Ative ou desative História, Padrinhos, Hospedagem e mais' },
            { icon: CheckCircle2, name: 'RSVP Digital', desc: 'Confirmação de presença online com notificações' },
        ],
    },
    {
        title: 'Gestão de Convidados',
        subtitle: 'Controle total sobre a lista e organização das mesas',
        icon: Users,
        color: 'from-blue-500/10 to-indigo-500/10',
        features: [
            { icon: Users, name: 'Lista Inteligente', desc: 'Importe, organize por grupos e acompanhe status' },
            { icon: Grid3X3, name: 'Mapa de Mesas', desc: 'Arrastar e soltar convidados nas mesas com drag & drop' },
            { icon: ScanLine, name: 'Check-in Digital', desc: 'QR Code individual para recepção no dia do evento' },
        ],
    },
    {
        title: 'Comunicação',
        subtitle: 'Mantenha todos informados sem esforço',
        icon: MessageSquare,
        color: 'from-violet-500/10 to-pink-500/10',
        features: [
            { icon: MessageSquare, name: 'Central de Mensagens', desc: 'Envie avisos personalizados para grupos de convidados' },
            { icon: CalendarHeart, name: 'Save the Date', desc: 'Avisos automáticos com datas e detalhes do evento' },
            { icon: Bot, name: 'Gabi AI', desc: 'Assistente IA que responde dúvidas dos convidados 24/7' },
        ],
    },
    {
        title: 'Planejamento',
        subtitle: 'Organize cada detalhe do grande dia',
        icon: ClipboardList,
        color: 'from-amber-500/10 to-orange-500/10',
        features: [
            { icon: ClipboardList, name: 'Checklist', desc: 'Tarefas organizadas por prazo com progresso visual' },
            { icon: DollarSign, name: 'Orçamento', desc: 'Controle financeiro com categorias e pagamentos' },
            { icon: Briefcase, name: 'Fornecedores', desc: 'Gerencie contratos, contatos e cronograma de pagamentos' },
            { icon: Gift, name: 'Lista de Presentes', desc: 'Presentes com links e controle de reservas' },
        ],
    },
    {
        title: 'Dia do Evento',
        subtitle: 'Tudo sob controle em tempo real',
        icon: Zap,
        color: 'from-rose-500/10 to-red-500/10',
        features: [
            { icon: ScanLine, name: 'Recepção Digital', desc: 'Porteiro com QR scanner e lista em tempo real' },
            { icon: BarChart3, name: 'Analytics ao Vivo', desc: 'Confirmados, presentes e métricas em tempo real' },
            { icon: Zap, name: 'War Room', desc: 'Painel de controle para cerimonialistas no grande dia' },
        ],
    },
]

export default function MarketingLandingPage() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
            <title>MarryFlow — O Seu Casamento Perfeito</title>
            <meta name="description" content="A plataforma definitiva que une cerimonialistas e noivos com Gabi, a sua IA." />

            <MasterHeader type="landing" />

            <main id="main" className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-6">

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
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

                    {/* Features Section */}
                    <div className="mt-32 space-y-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                Tudo que você precisa, em um só lugar
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-[50ch] mx-auto">
                                Do planejamento à recepção, o MarryFlow cuida de cada detalhe.
                            </p>
                        </motion.div>

                        {FEATURE_GROUPS.map((group, gi) => {
                            const GroupIcon = group.icon
                            return (
                                <motion.div
                                    key={group.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-100px' }}
                                    transition={{ duration: 0.6, delay: gi * 0.05 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                                            <GroupIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground tracking-tight">{group.title}</h3>
                                            <p className="text-sm text-muted-foreground">{group.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className={`grid sm:grid-cols-${group.features.length > 3 ? '4' : '3'} gap-4`}>
                                        {group.features.map((feat) => {
                                            const FeatIcon = feat.icon
                                            return (
                                                <div
                                                    key={feat.name}
                                                    className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 transition-all hover:bg-card/70 hover:shadow-lg hover:-translate-y-0.5 group"
                                                >
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                                        <FeatIcon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <h4 className="font-bold text-foreground text-sm mb-1">{feat.name}</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* CTA Final */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-32 text-center"
                    >
                        <div className="max-w-xl mx-auto rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-12 backdrop-blur-sm">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Pronto para começar?</h2>
                            <p className="text-muted-foreground mb-8">
                                Crie seu evento em 2 minutos. Sem cartão de crédito.
                            </p>
                            <Link
                                href={user ? "/projects" : "/login"}
                                className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-lg font-bold px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 soft-shadow-hover"
                            >
                                {user ? "Acessar Meus Eventos" : "Começar Agora — Grátis"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
