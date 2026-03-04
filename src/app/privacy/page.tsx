import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Política de Privacidade | MarryFlow',
    description: 'Política de Privacidade e Proteção de Dados do MarryFlow, em conformidade com ISO 27701, GDPR e LGPD.',
}

export default function PrivacyPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif mb-8 text-primary">Política de Privacidade</h1>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-sans">
                <section>
                    <h2 className="text-2xl font-serif text-foreground">1. Introdução</h2>
                    <p className="text-muted-foreground">
                        O MarryFlow ("nós", "nosso", "plataforma") está comprometido em proteger a sua privacidade e segurança.
                        Esta Política de Privacidade explica como coletamos, usamos, protegemos e processamos os seus dados pessoais,
                        seguindo as diretrizes da **ISO 27701**, **GDPR** (Regulamento Geral sobre a Proteção de Dados da UE) e
                        **LGPD** (Lei Geral de Proteção de Dados Pessoais do Brasil).
                    </p>
                </section>

                <section>
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

                <section>
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

                <section>
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

                <section>
                    <h2 className="text-2xl font-serif text-foreground">5. Segurança dos Dados (ISO 27001)</h2>
                    <p className="text-muted-foreground">
                        Utilizamos criptografia de ponta a ponta (AES-256), controles de acesso rigorosos e auditorias periódicas
                        para garantir a confidencialidade, integridade e disponibilidade das suas informações.
                    </p>
                </section>

                <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <h2 className="text-xl font-serif text-primary mb-2">Contato do DPO</h2>
                    <p className="text-sm text-muted-foreground">
                        Para exercer seus direitos ou reportar incidentes, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail:
                        <strong> privacy@marryflow.com</strong>
                    </p>
                </section>
            </div>
        </main>
    )
}
