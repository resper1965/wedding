# Architecture & Multi-Tenancy

O **WeddingApp** foi modelado sob o paradigma de **Software-as-a-Service (SaaS)** Multi-Tenant. Isso significa que um único deploy da aplicação e um único banco de dados atendem a milhares de casamentos independentes, garantindo vazamento ZERO de dados entre inquilinos.

## Isolamento de Inquilinos (Tenant Gating)

O coração dessa proteção é a função RLS (Row-Level Security) do PostgreSQL (Supabase).

1. **Estrutura "Profile" vs "Auth.Users":** 
Quando a conta autentica no Next.js (via OAuth / Email), associamos ela a um registro na tabela `Profile`, que determina sua cota `max_weddings`.
2. **Tabela de Raiz (Wedding):** 
Cada casamento tem um ID (UUID) que age como o **TenantID**. Ele pertence a um `owner_id`. Todas as transações do banco (Convidados, Finanças, Concierge) estão engatadas nesse UUID. 

## A Ponte entre o Cliente e a Inteligência Múltipla

Para evitar sobrecarregar o Next.js com processos pesados computacionalmente da Inteligência Artificial:

- **Next.js Vercel Node (Edge & Serverless):** Mantém as lógicas de View, Interface rica SSR/SSG, Checkout Financeiro e Dashboard do Assessor.
- **Python Cloud Run (Em desacoplamento):** É acionado pela Vercel via API assíncrona para processar Embeddings do RAG do OpenAI e ditar as interações no WhatsApp Webhook (Meta Graph).

## Estratégias de Recuperação de Legado (Backfill)

Como políticas de Gating em Banco Relacional às vezes não pegam usuários que se inscreveram 'no passado', a Rota `/api/wedding` atua de Fallback, identificando `is_super_admin` e forçando as regras na via (Sem Migrations destrutivas).
