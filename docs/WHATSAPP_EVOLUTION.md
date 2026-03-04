# Setup do Evolution API - MarryFlow Concierge

O MarryFlow utiliza o **Evolution API v2** como motor principal de WhatsApp, enviando e recebendo mensagens através de simuladores de Web (Baileys) para se conectar aos convidados. A inteligência artificial (*AI Concierge*) recebe todas essas mensagens, interpreta os contextos e executa ações no banco de dados.

## 1. Dados Básicos do Servidor

A nossa API de WhatsApp está hospedada e online no seguinte endereço fornecido pela agência/sysadmin:

* **URL Base:** `https://evo.ness.com.br`

---

## 2. Passo a Passo Inicial: Criação da Instância

Uma "instância" no Evolution API corresponde a um número de celular físico (um chip do WhatsApp).

1. Entre no **Painel do Evolution Manager** da URL acima.
2. Adicione uma nova instância com um nome de projeto, ex: `marryflow-01`.
3. Escaneie o **QR Code** exibido na tela do servidor utilizando o aplicativo WhatsApp Normal ou Business do aparelho (em "Aparelhos Conectados").
4. A partir deste momento, a sua instância já está autorizada a realizar disparos.

---

## 3. Configuração do Webhook (Receptor)

Para que o MarryFlow "Ouça" o que o convidado digitou, precisamos adicionar o Webhook do projeto no Evolution.

Acesse a guia **Webhooks** da sua Instância recém-criada no painel Evolution Manager.
1. **URL de Destino:** `https://wedding.louise.com.br/api/webhook/whatsapp` (Substitua por seu localhost/ngrok em dev local).
2. **Eventos (Events):** Marque somente a caixa `messages.upsert` (Isso notifica textos recebidos).
3. **Ativar/Salvar:** Deixe habilitado para receber a carga viva da plataforma.

---

## 4. Variáveis de Ambiente (.env) e Vercel

Para o servidor back-end do MarryFlow (Next.js) se conectar à conta, vá nas variáveis de Deploy (**Vercel > Settings > Environment Variables**) ou no seu `.env.local`:

```env
# ======== EVOLUTION API ========
# A URL mapeada para o seu endpoint Evolution (Não adicione barras no final)
EVOLUTION_API_URL="https://evo.ness.com.br"

# Global API Key para liberação no Firewall da Evolution
EVOLUTION_API_KEY="sua_chave_global_evolution"

# Nome exato da instância cadastrada (Passo 2)
EVOLUTION_INSTANCE="marryflow-01"

# ======== INTELIGÊNCIA ARTIFICIAL ========
# SDK da z.ai requer a chave no ambiente
Z_AI_API_KEY="sua_chave_zai"
```

A SDK no código (`src/services/whatsapp/client.ts`) já está inteiramente refatorada e pronta. Ela varre as credenciais acima; se encontrá-las, todo o tráfego do MarryFlow bypassa os servidores do Facebook Cloud API para economizar recursos e utiliza puramente sua base da Ness.

## 5. Testando

Para testar no Dev local ou Produção:
1. Envie uma mensagem como `"Oi!"` ou *"Iremos ao seu casamento, e somos celíacos"* para o número do QR Code conectado.
2. Observe as invocações de banco de dados (funções RAG e de Intent `confirmGuest`, `updateDietary`).
3. O Concierge processa a NLP, grava no Supabase e manda o `POST` para `https://evo.ness.com.br/message/sendText/marryflow-01` agradecendo ao convidado.
