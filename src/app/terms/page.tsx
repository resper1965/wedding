import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Termos de Serviço | MarryFlow',
    description: 'Termos de Serviço e Condições de Uso do MarryFlow.',
}

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background py-24 px-4 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute -top-64 -right-64 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-64 -left-64 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-16 text-foreground tracking-tight">Termos de <span className="text-primary italic font-light">Serviço</span></h1>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-sans">
                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">1. Aceitação dos Termos</h2>
                        <p className="text-muted-foreground">
                            Ao acessar e usar o MarryFlow, você concorda em cumprir e estar vinculado a estes Termos de Serviço e à nossa Política de Privacidade.
                        </p>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">2. Uso da Plataforma</h2>
                        <p className="text-muted-foreground">
                            O MarryFlow é uma ferramenta de concierge executivo para gestão de casamentos. O uso indevido da plataforma para spam, assédio ou atividades ilegais resultará em suspensão imediata da conta.
                        </p>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">3. Responsabilidade pelos Dados</h2>
                        <p className="text-muted-foreground">
                            Você é responsável pela veracidade dos dados de convidados inseridos na plataforma. O MarryFlow garante a segurança técnica desses dados conforme as normas ISO 27001, mas não se responsabiliza por acessos decorrentes de compartilhamento indevido de credenciais por parte do usuário.
                        </p>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">4. Propriedade Intelectual</h2>
                        <p className="text-muted-foreground">
                            Todo o design, código e a inteligência da agente **Gabi AI** são propriedade exclusiva do MarryFlow.
                        </p>
                    </section>

                    <section className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border/40 soft-shadow">
                        <h2 className="text-2xl font-serif text-foreground">5. Limitação de Responsabilidade</h2>
                        <p className="text-muted-foreground">
                            Embora busquemos a excelência e disponibilidade contínua, o MarryFlow não garante que a plataforma esteja livre de interrupções momentâneas.
                        </p>
                    </section>

                    <section className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30 text-center py-8">
                        Última atualização: {new Date().toLocaleDateString('pt-BR')}
                    </section>
                </div>
            </div>
        </main>
    )
}
