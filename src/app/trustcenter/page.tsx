'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, CheckCircle2, Globe, Database, ShieldCheck, Zap, Heart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Navigation, PageTransition, SidebarNav, BottomNav } from '@/components/ui-custom/Navigation'
import { AppFooter } from '@/components/layout/AppFooter'
import { BrandLogo } from '@/components/ui-custom/BrandLogo'

export default function TrustCenterPage() {
    const securityFeatures = [
        {
            icon: <Lock className="h-6 w-6" />,
            title: "Proteção de Nível Bancário",
            description: "Todos os dados são protegidos com os mais altos padrões de criptografia em trânsito e em repouso.",
            badge: "Encrypted"
        },
        {
            icon: <Eye className="h-6 w-6" />,
            title: "Auditoria e Transparência",
            description: "Cada interação com dados sensíveis é monitorada e registrada para garantir total rastreabilidade.",
            badge: "Certified"
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: "Resiliência Geográfica",
            description: "Infraestrutura de alta performance com redundância em múltiplos centros de processamento.",
            badge: "Resilient"
        },
        {
            icon: <ShieldCheck className="h-6 w-6" />,
            title: "Conformidade Global",
            description: "Totalmente adequado às normas de privacidade nacionais e internacionais (LGPD/GDPR).",
            badge: "Compliant"
        }
    ]

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="h-20 border-b border-border/40 bg-card/40 backdrop-blur-md flex items-center px-8 sticky top-0 z-50">
                <BrandLogo />
                <div className="ml-auto flex items-center gap-4">
                    <div className="px-6 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-accent font-bold uppercase tracking-[0.2em] border border-primary/20 shadow-lg shadow-primary/5">
                        Certified Trust Center
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
                <PageTransition>
                    <div className="text-center mb-24 space-y-6 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex h-20 w-20 rounded-[2rem] bg-primary/10 items-center justify-center text-primary mb-6 shadow-2xl shadow-primary/10 border border-primary/20 relative z-10"
                        >
                            <Shield className="h-10 w-10" />
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-serif font-bold text-foreground tracking-tight relative z-10">Centro de <span className="text-primary italic font-light">Confiança</span></h1>
                        <p className="text-muted-foreground/60 max-w-2xl mx-auto text-xl font-medium italic relative z-10">
                            Nossa prioridade é a segurança do seu momento mais especial. Conheça as tecnologias e protocolos que protegem seus dados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {securityFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-card/40 backdrop-blur-xl h-full border-border/40 hover:border-primary/30 transition-all duration-500 hover:translate-y-[-8px] rounded-[2.5rem] soft-shadow hover:shadow-2xl group">
                                    <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                            {feature.icon}
                                        </div>
                                        <div className="text-[10px] font-accent font-bold text-primary/40 uppercase tracking-[0.3em]">
                                            {feature.badge}
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold text-foreground">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground/60 leading-relaxed italic font-medium">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <Card className="bg-card/40 backdrop-blur-xl border-border/40 overflow-hidden rounded-[3rem] shadow-2xl">
                            <CardHeader className="bg-primary/5 border-b border-border/40 p-10">
                                <CardTitle className="font-serif text-3xl font-bold">Compromisso com OWASP</CardTitle>
                                <CardDescription className="font-accent uppercase text-[10px] tracking-[0.3em] font-bold text-primary/60">Resiliência Técnica</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="flex gap-6">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1 shadow-inner">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-lg">Sanitização Inteligente</h4>
                                        <p className="text-muted-foreground/60 italic font-medium">Proteção ativa contra injeção de scripts e manipulação de dados em todas as entradas.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1 shadow-inner">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-lg">Isolamento Multi-Tenant</h4>
                                        <p className="text-muted-foreground/60 italic font-medium">Garantia lógica de que seus dados nunca se cruzam com informações de outros usuários.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1 shadow-inner">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-lg">Rastreabilidade Total</h4>
                                        <p className="text-muted-foreground/60 italic font-medium">Logs permanentes para monitorar integridade e ações administrativas.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-8">
                            <Card className="glass-card border-border rounded-3xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="h-16 w-16 rounded-2xl bg-white/50 flex items-center justify-center text-primary shadow-inner">
                                            <Zap className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold">Monitoramento em Tempo Real</h3>
                                            <p className="text-sm text-muted-foreground">Status atual da infraestrutura e proteção perimetral.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: "WAF Filtering", status: "Active", width: "w-[94%]" },
                                            { label: "Data Encryption", status: "Enabled", width: "w-full" },
                                            { label: "DDoS Protection", status: "Shielded", width: "w-[98%]" }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-accent font-bold uppercase tracking-wider">
                                                    <span className="text-muted-foreground/60">{item.label}</span>
                                                    <span className="text-primary">{item.status}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: item.width.replace('w-[', '').replace(']', '') }}
                                                        transition={{ duration: 2, delay: i * 0.2, ease: "circOut" }}
                                                        className="h-full bg-primary/40 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-primary/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-accent font-bold uppercase tracking-widest text-emerald-600">All Systems Operational</span>
                                        </div>
                                        <code className="text-[9px] text-muted-foreground/40 font-mono">ID: SEC_STABLE_VERIFIED</code>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 text-center">
                                    <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <span className="text-[10px] font-accent font-bold uppercase tracking-widest block text-primary/60">Soberania de Dados</span>
                                    <span className="text-sm font-bold">Cloud Privada Nativa</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 text-center">
                                    <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <span className="text-[10px] font-accent font-bold uppercase tracking-widest block text-primary/60">Disponibilidade</span>
                                    <span className="text-sm font-bold">Resiliência Máxima</span>
                                </div>
                            </div>
                            <Card className="glass-card border-primary/10 rounded-3xl p-8 flex items-center justify-between group cursor-pointer hover:bg-primary/[0.02] transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">Vulnerability Disclosure Program</h4>
                                        <p className="text-xs text-muted-foreground">Responsabilidade técnica via RFC 9116. Contato: security@marryflow.com</p>
                                    </div>
                                </div>
                                <Zap className="h-4 w-4 text-primary/30" />
                            </Card>
                        </div>
                    </div>
                </PageTransition>
            </main>

            <AppFooter />
        </div>
    )
}
