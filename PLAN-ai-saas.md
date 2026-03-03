# Plan: Decoupling AI Agent & Transitioning to SaaS (Multi-Tenant)

## Overview
This plan outlines the dual transition of the Wedding Platform:
1.  **AI Decoupling (Option A):** Extracting the `ai-agent` and `concierge` logic into an independent microservice.
2.  **SaaS Support (Option B):** Refactoring the database and application layer to support multiple couples (multi-tenant) at zero infrastructure cost, heavily utilizing Google Cloud Platform (GCP) free tiers (Cloud Run & Firestore/Neon Postgres).

## Project Type
WEB (Next.js) & BACKEND (Cloud Functions/Run)
- Agents: `@backend-specialist`, `@database-architect`

## Success Criteria
- [ ] AI services (chat, RAG, WhatsApp webhook) run independently of the Next.js app on a zero-cost serverless platform (e.g., Cloudflare Workers or GCP Cloud Run free tier).
- [ ] Database schema is updated to support `tenantId` across all relevant tables.
- [ ] Next.js application routes handle dynamic tenants (e.g., `app.com/[tenant]/...`).
- [ ] The existing deployment continues to cost $0, leveraging free quotas.

## Tech Stack & Architecture (Zero Cost)
- **Frontend & Core API:** Next.js deployed on Vercel (Hobby Tier - Free).
- **Database:** Neon Serverless Postgres (Free Tier) - *Alternative: Firebase Firestore, but keeping Postgres is safer for relational SaaS data.*
- **AI Microservice:** Google Cloud Run (Free Tier allows 2M requests/month, 0 min-instances) or Cloudflare Workers (Free tier). We will aim for GCP (Cloud Run) since the user requested GCP architecture.
- **Authentication:** Supabase Auth (Free Tier).

## Task Breakdown

### Phase 1: SDLC Iterativo - Microservice Decoupling (Option A)

**Sprint 1: Estrutura e Deploy Base do Microserviço**
- **Requirements & Design:** Definir contrato da API (Next.js ↔ Microserviço) e escolher o runtime (Cloud Run via Docker ou Cloudflare Workers).
- **Development (`backend-specialist`):** Criar o novo repositório isolado e configurar a fundação (TypeScript, rotas base de health check).
- **Testing & Deployment (`devops-engineer`):** Implantar o serviço "vazio" no GCP Cloud Run (Free Tier) e garantir que o *scale-to-zero* funciona.

**Sprint 2: Migração da Inteligência e Webhooks**
- **Requirements & Design:** Mapear os endpoints existentes (`/api/concierge`, `/api/ai-agent`) que serão migrados.
- **Development (`backend-specialist`):** Mover a lógica do OpenAI, RAG e webhook do WhatsApp para o novo serviço. Garantir segurança nas chamadas.
- **Testing & Deployment (`test-engineer`):** Validar webhooks via Postman/ngrok local. Implantar no GCP e apontar a API do WhatsApp/Next.js para a nova URL.

### Phase 2: SDLC Iterativo - Evolução Multi-Tenant (Option B)

**Sprint 3: Fundação do Schema Multi-Casais**
- **Requirements & Design:** Mapear o impacto da adição do `tenantId` (ex: `weddingId`) no Prisma em modelos críticos (`Guest`, `Group`, `Event`, `Budget`).
- **Development (`database-architect`):** Atualizar o `schema.prisma`. *Crucial:* Criar scripts de migração de dados seguros se já houver um casamento ativo no ambiente.
- **Testing & Deployment:** Testar a persistência em banco local (Neon branch) antes de aplicar em produção.

**Sprint 4: Roteamento e Isolamento de Dados**
- **Requirements & Design:** Planejar como a UI saberá qual casamento acessar (subdomínio vs. rota estendida `/{weddingId}`).
- **Development (`frontend-specialist` & `backend-specialist`):** Atualizar o middleware do Next.js e refatorar TODAS as APIs para filtrar queries por `tenantId`.
- **Testing & Deployment (`test-engineer`):** Criar um "Casal de Teste". Garantir que, logado como Convidado A, é impossível ver dados do Convidado B (Casal Teste). Deploy final para Vercel.

### Phase 3: SDLC Iterativo - Geração de Valor e Polimento (SaaS Expand)

**Sprint 5: Refatoração Front-end para Multi-Tenant (Painel Administrativo)**
- **Requirements & Design:** O painel do Next.js atualmente carrega os grupos/convidados sem enviar o `tenantId` explicitamente. Precisamos integrar o Front-End com a Edge isolada.
- **Development (`frontend-specialist`):** Modificar os hooks de *data fetching* (`SWR` ou `fetch`) no painel (`/admin/*` ou `/dashboard/*`) para extrair o Casal via URL (ex: acessou `/[tenantId]/admin`) e passar ou depender da injeção do middleware. Adaptar os componentes UI.
- **Testing (`test-engineer`):** Validar que a tela de Grupos/Mesas carrega vazio para um casamento novo, e cheia para o casamento original.

**Sprint 6: Integração da Evolution API (WhatsApp Headless)**
- **Requirements & Design:** O envio do WhatsApp no microserviço é mockado (`server.log.info`). Precisamos enviar mensagens de verdade.
- **Development (`backend-specialist`):** Substituir o log pelo POST numa API de WhatsApp real (Evolution API/WWebJS) no Cloud Run. O payload de saída da OpenAI deve alimentar o canal do WhatsApp.
- **Testing:** Validar recebimento da mensagem no celular via Postman -> Microserviço -> Celular.

**Sprint 7: Pipeline de Deploy CI/CD no GCP (Cloud Run)**
- **Requirements & Design:** Automatizar a publicação do `ai-microservice` no Cloud Run via console/scripts locais zero-cost.
- **Development (`devops-engineer`):** Criar um script (`deploy.sh` ou no `package.json`) integrando o `gcloud build` e `gcloud run deploy`. Fixar alocação de CPU apenas durante request para taxa $0.
- **Testing:** Modificar um log, rodar o script e ver a mudança na nuvem pública.

**Sprint 8: Landing Page de Vendas (Go-to-Market)**
- **Requirements & Design:** Construir uma página estática atrativa para vender a plataforma para noivas/cerimonialistas demonstrando a IA.
- **Development (`frontend-specialist`, `seo-specialist`):** Criar `src/app/page.tsx` com design moderno, *pricing tables*, e features list.
- **Testing (`performance-optimizer`):** Validar Lighthouse da Landing Page em busca de nota 100/100, garantindo conversão.

### Phase 4: Monetização e Controle de Quotas (Billing & Gating)

**Sprint 9: Trava de Casais e Aprovação Manual (Super Admin)**
- **Requirements & Design:** Impedir a criação indiscriminada de Entidades (Casamentos/Tenants) por usuários comuns. Implementar um fluxo de "Aguardando Aprovação" ou Limite Cota via Painel do Super Admin, sem conectar ao Stripe (Cobrança out-of-band).
- **Development (`database-architect`, `backend-specialist`):** 
  - Criar tabela `Profile` no Supabase vinculada ao Auth contendo `is_super_admin` e `max_weddings`.
  - Adicionar proteção na `POST /api/wedding/route.ts` para checar limite (quota) do usuário antes de inserir no banco.
  - Implementar view no Front-End bloqueando o acesso e redirecionando para WhatsApp/E-mail do Admin pedindo "Liberação de Conta".
- **Testing:** Tentar criar 2 casamentos em uma conta Recém-Criada e ver a API retornar erro 403, enquanto a conta "Super Admin" pode criar ilimitados.

## Phase X: Verification
- [ ] Run Lint & Type Check: `npm run lint && npx tsc --noEmit`
- [ ] Run Security Scan: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] Verify GCP billing limits to ensure zero unexpected costs.

## ✅ PHASE X COMPLETE
- Lint: ⏳ Pending
- Security: ⏳ Pending
- Build: ⏳ Pending
- Date: 2026-03-02
