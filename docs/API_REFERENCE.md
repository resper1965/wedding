# API Reference & Endpoints

Este documento mapeia as APIs internas do Framework **Next.js (App Router)** utilizadas para comunicação server-side da aplicação.

Todas as rotas sob `/api/*` esperam comunicação via formato `application/json` e são protegidas por autenticação JWT (Sessão do Supabase `Authorization: Bearer <token>`).

## Wedding & Tenants

- **`GET /api/wedding`**
  - Carrega todos os Casamentos (`Profile(id) === owner_id`).
  - *Retorno:* Array de objetos (wedding).

- **`POST /api/wedding`**
  - Inicia a provisão de uma nova locação (Tenant).
  - *Gating Automático:* Antes do INSERT, aciona a RPC de RLS `can_create_wedding(userId)` para assegurar que a cota/plano do usuário permita a criação. Se as credenciais estiverem sujas ou o legacy user não possuir linha na tabela `Profile`, ocorre a rotina de auto-Backfill.
  - *Body Mínimo:* `{ "partner1Name": "string", "partner2Name": "string", "weddingDate": "ISO" }`

- **`PUT /api/wedding`**
  - Atualiza detalhes (Data, Endereço, Nome) com injeção requerida do identificador em `Headers['x-tenant-id']`.
  
## Integrações Futuras

### Rota de RAG / WhatsApp (Webhook Cloud Run):
O endpoint do bot WhatsApp e LLM não compartilha latência de Request/Response com o Next.js. Toda vez que um Assessor altera dados sensíveis da festa pelo Dashboard, a Vercel pode disparar um Webhook PUSH pro Worker Python retreinar seus Embeddings vetoriais passivamente.

## Segurança na Comunicação

Qualquer injeção de Headers malformada é rejeitada por Validação de Sanitização em tempo de Rota com HTTP 400 Bad Request, para mitigar manipulações de TenantID.
