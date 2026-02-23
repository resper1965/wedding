# 💍 Wedding Guest Management Platform

Uma plataforma elegante e minimalista para gestão de convidados de casamento, com estilo **Indie** - boêmio, artesanal e orgânico.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Características

- 🎨 **Estilo Indie** - Design boêmio com tons terrosos (âmbar, terracotta, sage, rose)
- 👤 **Autenticação Google** - Login seguro via OAuth
- 👥 **Gestão de Convidados** - CRUD completo com grupos familiares
- 💌 **Sistema RSVP** - Respostas via link único para cada convidado
- 📊 **Dashboard** - Estatísticas e countdown em tempo real
- 📱 **Responsivo** - Mobile-first design
- 🔗 **Página Pública** - Informações do casamento acessíveis a todos

## 🚀 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript 5
- **Banco de Dados**: PostgreSQL (Neon) com Prisma ORM
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Animações**: Framer Motion
- **Autenticação**: Firebase Auth (Google Provider)
- **Real-time**: Firebase Firestore (check-in)
- **Concierge**: Cloud Functions + WhatsApp Business API + OpenAI
- **Deploy**: Vercel (free tier)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/resper1965/wedding.git
cd wedding

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações do banco
bun run db:push

# Inicie o servidor de desenvolvimento
bun run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados (Neon Postgres - free tier)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Firebase (obter em Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Deploy no Cloud Run (GCP)

1. Build e push da imagem:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/wedding
   ```
2. Deploy com min-instances=0 (free tier):
   ```bash
   gcloud run deploy wedding \
     --image gcr.io/PROJECT_ID/wedding \
     --region southamerica-east1 \
     --allow-unauthenticated \
     --min-instances 0 \
     --max-instances 1 \
     --set-env-vars DATABASE_URL=your-neon-url
   ```

## 📱 Funcionalidades

### Dashboard
- Countdown para o casamento
- Estatísticas de convidados (confirmados, recusados, pendentes)
- Timeline de atividade recente
- Progresso visual das respostas

### Gestão de Convidados
- Adicionar/Editar/Excluir convidados
- Organizar em grupos familiares
- Categorias personalizadas (Família, Amigos, Trabalho)
- Restrições alimentares e necessidades especiais
- Link único de convite para cada convidado

### Sistema RSVP
- Página pública de resposta para convidados
- Múltiplos eventos (Cerimônia, Recepção)
- Confirmação com ou sem acompanhante
- Mensagem personalizada dos convidados

### Comunicação
- Templates de mensagens
- Canais: WhatsApp e Email
- Lembretes para pendentes

### Configurações
- Editar nomes dos noivos
- Data e local do casamento
- Criar/Editar eventos
- Mensagem para convidados

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Autenticação OAuth
│   │   ├── wedding/             # Dados do casamento
│   │   ├── events/              # Eventos
│   │   ├── guests/              # Convidados
│   │   ├── groups/              # Grupos
│   │   ├── rsvp/                # Respostas
│   │   └── invite/[token]/      # Página pública RSVP
│   ├── login/                   # Página de login
│   ├── info/                    # Página pública info
│   └── page.tsx                 # Dashboard principal
├── components/
│   ├── auth/                    # Componentes de autenticação
│   ├── dashboard/               # Componentes do dashboard
│   ├── guests/                  # Gestão de convidados
│   ├── messages/                # Centro de mensagens
│   ├── settings/                # Configurações
│   └── ui/                      # Componentes shadcn/ui
├── lib/
│   └── db.ts                    # Cliente Prisma
└── types/
    └── index.ts                 # Tipos TypeScript
```

## 🎨 Paleta de Cores (Indie)

| Cor | Uso |
|-----|-----|
| Amber | Primário, destaques |
| Terracotta | Acentos quentes |
| Sage | Confirmações |
| Rose | Romântico, corações |
| Olive | Texto secundário |
| Cream | Fundos |

## 📝 Scripts

```bash
bun run dev      # Servidor de desenvolvimento
bun run build    # Build de produção
bun run lint     # Verificar código
bun run db:push  # Sincronizar schema
```

## 🔧 Troubleshooting

### Erro de cache do Turbopack

Se encontrar erros de módulo não encontrado após instalar pacotes:

```bash
# Limpar cache do Next.js
rm -rf .next node_modules/.cache

# Reinstalar dependências
bun install

# Reiniciar servidor
bun run dev
```

### Erro de banco de dados

```bash
# Recriar banco
rm -f db/wedding.db
bun run db:push
```

## 👰🤵 Sobre

Plataforma desenvolvida para o casamento de **Louise & Nicolas**.

---

Feito com ❤️ para o grande dia
