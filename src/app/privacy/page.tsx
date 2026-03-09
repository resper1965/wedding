import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Política de Privacidade | MarryFlow',
    description: 'Política de Privacidade e Proteção de Dados do MarryFlow, em conformidade com ISO 27701, GDPR e LGPD.',
}

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background py-24 px-4 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute -top-64 -right-64 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-64 -left-64 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 mb-12 px-6 py-3 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 text-[10px) font-accent font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/20 hover:scale-105 transition-all group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Voltar ao Painel
                </Link>

                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-16 text-foreground tracking-tight">Política de <span className="text-primary italic font-light">Privacidade</span></h1>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-sans">
                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">1. Introdução</h2>
                        <p className="text-muted-foreground">
                            O MarryFlow ("nós", "nosso", "plataforma") está comprometido em proteger a sua privacidade e segurança.
                            Esta Política de Privacidade explica como coletamos, usamos, protegemos e processamos os seus dados pessoais,
                            seguindo as diretrizes da **ISO 27701**, **GDPR** (Regulamento Geral sobre a Proteção de Dados da UE) e
                            **LGPD** (Lei Geral de Proteção de Dados Pessoais do Brasil).
                        </p>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">2. Dados que Coletamos</h2>
                        <p className="text-muted-foreground">
                            Coletamos apenas os dados estritamente necessários para o funcionamento do seu concierge executivo de casamentos:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground">
                            <li><strong>Identificação:</strong> Nome completo, e-mail, telefone.</li>
                            <li><strong>Gestão de Convidados:</strong> Nomes, restrições alimentares e status de confirmação (RSVP).</li>
                            <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de navegador (para segurança e auditoria ISO 27001).</li>
                        </ul>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">3. Finalidade do Tratamento</h2>
                        <p className="text-muted-foreground">
                            Seus dados são processados para:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground">
                            <li>Personalizar a experiência de planejamento do seu evento.</li>
                            <li>Garantir a segurança da plataforma e prevenir fraudes (ISO 27001).</li>
                            <li>Cumprir obrigações legais e regulatórias.</li>
                        </ul>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">4. Seus Direitos (GDPR & LGPD)</h2>
                        <p className="text-muted-foreground">
                            Como titular dos dados, você possui os seguintes direitos:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground">
                            <li><strong>Acesso e Portabilidade:</strong> Solicitar uma cópia de seus dados em formato estruturado.</li>
                            <li><strong>Correção:</strong> Retificar dados incompletos ou inexatos.</li>
                            <li><strong>Exclusão:</strong> Solicitar a eliminação definitiva de seus dados ("Direito ao Esquecimento").</li>
                            <li><strong>Revogação do Consentimento:</strong> Retirar sua autorização para processamento a qualquer momento.</li>
                        </ul>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">5. Segurança dos Dados (ISO 27001)</h2>
                        <p className="text-muted-foreground">
                            Utilizamos criptografia de ponta a ponta (AES-256), controles de acesso rigorosos e auditorias periódicas
                            para garantir a confidencialidade, integridade e disponibilidade das suas informações.
                        </p>
                    </section>

                    <section className="bg-primary/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-primary/20 soft-shadow text-center">
                        <h2 className="text-3xl font-serif text-primary mb-4">Contato do DPO</h2>
                        <p className="text-muted-foreground mb-6">
                            Para exercer seus direitos ou reportar incidentes, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail:
                        </p>
                        <div className="inline-block px-8 py-4 bg-background rounded-2xl border border-primary/20 text-primary font-bold">
                            privacy@marryflow.com
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
