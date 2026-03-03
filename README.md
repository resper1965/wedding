# WeddingApp 💍

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

> A Plataforma SaaS definitiva (Enterprise-Grade) para gestão de eventos, focada em cerimonialistas, espaços corporativos e casais independentes. Engajada com SEO OGP e IA-Friendly.

## At a Glance

O **WeddingApp** revoluciona o fluxo de casamentos através das seguintes vertentes:
- **Painel Multi-Tenant**: Gestão de múltiplos casais com isolamento de dados via PostgreSQL (Row-Level Security).
- **Concierge IA Integrado**: Bot de WhatsApp para tirar dúvidas de "Dress Code", "Local" e fazer RSVP com inteligência.
- **Micro-SaaS Gating**: Sistema de Limites (Quotas) controlando que usuários Free acessem 1 casamento, e Agências Acessem N eventos sob assinatura.
- **Segurança (SSDLC)**: Blindagem ponta-a-ponta com Headers (HSTS, CSP), Auditoria de Dependências Automática e Manifesto de Vulnerabilidades.

## Tech Stack & Architecture

- **Web Frontend:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide Icons, Shadcn/UI (Acessibilidade via Radix).
- **Backend & Auth:** Supabase (Auth, RLS, Storage), Integração nativa Edge-Ready.
- **AI Microservice:** Python 3 (FastAPI/Flask) via Cloud Run (Opcional - Em desacoplamento).
- **Testing:** Vitest (Red-Green-Refactor Pattern).

Para conhecer o desenho profundo entre as APIs e o Data Layer, consulte a [Documentação de Arquitetura](./docs/ARCHITECTURE.md).

## Quickstart

Os guias a seguir assumem que você tenha Node `>=20.9.0`.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/resper1965/wedding.git
   cd wedding
   ```
2. **Instale as Dependências (Travadas por Lockfile):**
   ```bash
   npm ci
   ```
3. **Configure o Ambiente:**
   Copie `.env.local.example` para `.env.local` e preencha as variáveis do Supabase.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. **Suba o Servidor (Desenvolvimento):**
   ```bash
   npm run dev
   ```
   A aplicação brilhará na porta `3000`.

## Documentação Associada

- [Arquitetura & Multi-Tenancy](./docs/ARCHITECTURE.md)
- [Referência de API & Hooks](./docs/API_REFERENCE.md)
- [Cartilha DevSecOps & Compliance](./docs/DEVSECOPS.md)
