import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Termos de Serviço | MarryFlow',
    description: 'Termos de Serviço e Condições de Uso do MarryFlow.',
}

export default function TermsPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif mb-8 text-primary">Termos de Serviço</h1>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-sans">
                <section>
                    <h2 className="text-2xl font-serif text-foreground">1. Aceitação dos Termos</h2>
                    <p className="text-muted-foreground">
                        Ao acessar e usar o MarryFlow, você concorda em cumprir e estar vinculado a estes Termos de Serviço e à nossa Política de Privacidade.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif text-foreground">2. Uso da Plataforma</h2>
                    <p className="text-muted-foreground">
                        O MarryFlow é uma ferramenta de concierge executivo para gestão de casamentos. O uso indevido da plataforma para spam, assédio ou atividades ilegais resultará em suspensão imediata da conta.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif text-foreground">3. Responsabilidade pelos Dados</h2>
                    <p className="text-muted-foreground">
                        Você é responsável pela veracidade dos dados de convidados inseridos na plataforma. O MarryFlow garante a segurança técnica desses dados conforme as normas ISO 27001, mas não se responsabiliza por acessos decorrentes de compartilhamento indevido de credenciais por parte do usuário.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif text-foreground">4. Propriedade Intelectual</h2>
                    <p className="text-muted-foreground">
                        Todo o design, código e a inteligência da agente **Gabi AI** são propriedade exclusiva do MarryFlow.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif text-foreground">5. Limitação de Responsabilidade</h2>
                    <p className="text-muted-foreground">
                        Embora busquemos a excelência e disponibilidade contínua, o MarryFlow não garante que a plataforma esteja livre de interrupções momentâneas.
                    </p>
                </section>

                <section className="text-xs text-muted-foreground/50 italic">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </section>
            </div>
        </main>
    )
}
