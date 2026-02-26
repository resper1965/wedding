-- ============================================================================
-- MIGRATION 001 — Novas Features
-- Executar no Supabase: SQL Editor → colar e executar
-- ============================================================================
--
-- ANÁLISE: O schema existente já suporta TODAS as novas features.
-- Nenhuma coluna nova é obrigatória para funcionar.
--
-- Este arquivo contém:
-- 1. Verificações de segurança (IF NOT EXISTS)
-- 2. Índices de performance para os novos módulos
-- 3. Políticas RLS para o módulo Porteiro (acesso público controlado)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE
-- (Melhoram a velocidade das queries dos novos módulos)
-- ----------------------------------------------------------------------------

-- Porteiro: lista de convidados ordenada por nome
CREATE INDEX IF NOT EXISTS idx_guest_wedding_name
  ON "Guest" ("weddingId", "firstName", "lastName");

-- Porteiro: check-in status via Invitation
CREATE INDEX IF NOT EXISTS idx_invitation_wedding_checkin
  ON "Invitation" ("weddingId", "checkedIn");

-- Save the Date: buscar convidados por status de convite
CREATE INDEX IF NOT EXISTS idx_guest_invite_status
  ON "Guest" ("weddingId", "inviteStatus");

-- Filtro por quem convida: relationship field
CREATE INDEX IF NOT EXISTS idx_guest_relationship
  ON "Guest" ("weddingId", "relationship");

-- Presentes: buscar por status e categoria
CREATE INDEX IF NOT EXISTS idx_gift_wedding_status
  ON "Gift" ("weddingId", "status", "category");

-- MessageLog: histórico de Save the Date enviados
CREATE INDEX IF NOT EXISTS idx_messagelog_guest_type
  ON "MessageLog" ("guestId", "type");


-- ----------------------------------------------------------------------------
-- RLS (Row Level Security) — Módulo Porteiro
-- O porteiro acessa /porteiro sem autenticação JWT admin.
-- As rotas /api/checkin/* são públicas no middleware.
-- Nenhuma RLS adicional necessária — as rotas já são públicas.
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- VERIFICAÇÃO DE COLUNAS EXISTENTES
-- (Confirma que o schema atual já tem tudo que precisamos)
-- ----------------------------------------------------------------------------

-- Confirma que Guest.relationship existe (usado para Noivo/Noiva/Casal)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Guest' AND column_name = 'relationship'
  ) THEN
    ALTER TABLE "Guest" ADD COLUMN "relationship" TEXT;
    RAISE NOTICE 'Coluna relationship adicionada ao Guest';
  ELSE
    RAISE NOTICE 'Guest.relationship já existe — OK';
  END IF;
END $$;

-- Confirma que Gift.externalUrl existe (link de loja Amazon, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Gift' AND column_name = 'externalUrl'
  ) THEN
    ALTER TABLE "Gift" ADD COLUMN "externalUrl" TEXT;
    RAISE NOTICE 'Coluna externalUrl adicionada ao Gift';
  ELSE
    RAISE NOTICE 'Gift.externalUrl já existe — OK';
  END IF;
END $$;

-- Confirma que Gift.store existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Gift' AND column_name = 'store'
  ) THEN
    ALTER TABLE "Gift" ADD COLUMN "store" TEXT;
    RAISE NOTICE 'Coluna store adicionada ao Gift';
  ELSE
    RAISE NOTICE 'Gift.store já existe — OK';
  END IF;
END $$;

-- Confirma que Wedding.conciergeContext existe (contexto para o Agente IA)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Wedding' AND column_name = 'conciergeContext'
  ) THEN
    ALTER TABLE "Wedding" ADD COLUMN "conciergeContext" TEXT;
    RAISE NOTICE 'Coluna conciergeContext adicionada ao Wedding';
  ELSE
    RAISE NOTICE 'Wedding.conciergeContext já existe — OK';
  END IF;
END $$;

-- Confirma que Invitation.checkedIn existe (check-in do porteiro)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Invitation' AND column_name = 'checkedIn'
  ) THEN
    ALTER TABLE "Invitation" ADD COLUMN "checkedIn" BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE "Invitation" ADD COLUMN "checkedInAt" TIMESTAMPTZ;
    RAISE NOTICE 'Colunas checkedIn/checkedInAt adicionadas ao Invitation';
  ELSE
    RAISE NOTICE 'Invitation.checkedIn já existe — OK';
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- DONE
-- ----------------------------------------------------------------------------
-- Após executar, confirme no output do Supabase que todos os RAISE NOTICE
-- mostram "já existe — OK" para o seu banco de dados.
-- Se algum campo foi adicionado, rode o app e teste normalmente.
-- ============================================================================
