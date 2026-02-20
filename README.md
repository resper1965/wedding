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
- **Banco de Dados**: SQLite com Prisma ORM
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Animações**: Framer Motion
- **Autenticação**: NextAuth.js v4 com Google Provider

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
# Banco de Dados
DATABASE_URL=file:./db/wedding.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aleatorio-aqui

# Google OAuth (obter em Google Cloud Console)
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

### Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Crie **OAuth 2.0 Client ID**
5. Adicione as URLs autorizadas:
   - Origem: `http://localhost:3000`
   - Redirect: `http://localhost:3000/api/auth/callback/google`
6. Copie Client ID e Client Secret para `.env`

### Deploy no Firebase

1. Instale Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Inicialize: `firebase init hosting`
4. Build: `bun run build`
5. Deploy: `firebase deploy`

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
