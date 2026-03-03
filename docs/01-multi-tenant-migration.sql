-- SQL Commands to migrate existing data and ensure Multi-Tenant Architecture
-- Note: The application uses `weddingId` as the de facto `tenantId`.

-- 1. Create a Wedding (Tenant)
-- INSERT INTO public."Wedding" ("id", "partner1Name", "partner2Name", ...) VALUES ('wedding-1', 'Louise', 'Nicolas', ...);

-- 2. Ensure all primary tables have `weddingId` referencing `Wedding(id)` with CASCADE delete.

ALTER TABLE public."Guest" 
  ADD CONSTRAINT fk_guest_wedding
  FOREIGN KEY ("weddingId") 
  REFERENCES public."Wedding"("id") 
  ON DELETE CASCADE;

ALTER TABLE public."Event" 
  ADD CONSTRAINT fk_event_wedding
  FOREIGN KEY ("weddingId") 
  REFERENCES public."Wedding"("id") 
  ON DELETE CASCADE;

ALTER TABLE public."GuestGroup" 
  ADD CONSTRAINT fk_guestgroup_wedding
  FOREIGN KEY ("weddingId") 
  REFERENCES public."Wedding"("id") 
  ON DELETE CASCADE;

ALTER TABLE public."Table" 
  ADD CONSTRAINT fk_table_wedding
  FOREIGN KEY ("weddingId") 
  REFERENCES public."Wedding"("id") 
  ON DELETE CASCADE;

ALTER TABLE public."MessageTemplate" 
  ADD CONSTRAINT fk_message_template_wedding
  FOREIGN KEY ("weddingId") 
  REFERENCES public."Wedding"("id") 
  ON DELETE CASCADE;

ALTER TABLE public."Invitation" 
  ADD CONSTRAINT fk_invitation_wedding
  FOREIGN KEY ("weddingId") 
  REFERENCES public."Wedding"("id") 
  ON DELETE CASCADE;

-- 3. Row Level Security (RLS) policies for true SaaS isolation
-- We assume that requests passing through Supreme/Middleware will contain `weddingId` in the JWT or Context.

ALTER TABLE public."Guest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation on Guest" 
  ON public."Guest" 
  FOR ALL 
  USING ("weddingId" = current_setting('app.current_tenant_id', true));

-- Apply similar policies to all other tables.
