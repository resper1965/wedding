# Plan: Evolution API Integration & Multi-Tenant Consolidation

## Overview
This plan focuses on two critical fronts:
1.  **Security/SaaS Consolidation (Option A):** Ensuring 100% data isolation between tenants by auditing all API routes and fixing the `/api/checkin` data leak.
2.  **Evolution API Integration (Option B):** Transitioning the "AI Concierge" from mock logs to real WhatsApp messaging using the Evolution API.

## Project Type
WEB (Next.js) & BACKEND (Supabase/Edge)

## Success Criteria
- [ ] **Data Isolation**: All endpoints in `src/app/api` verify `x-tenant-id` and use `verifyTenantAccess`.
- [ ] **WhatsApp Integration**: Inbound messages from Evolution API trigger AI responses, and outbound messages are sent via Evolution API.
- [ ] **AI Concierge**: "Brain" logic refined to handle real-world WhatsApp payloads and status updates.
- [ ] **Super Admin**: Quota management system verified.

## Tech Stack
- **API Monitoring**: Evolution API (WhatsApp Headless).
- **AI**: GPT-4o via `z-ai-web-dev-sdk`.
- **Database**: Supabase.
- **Backend**: Next.js App Router (Vercel).

## Task Breakdown

### Phase 1: Security Audit & Tenant Isolation (Foundation - P0)
**Agent:** `security-auditor` | **Skills:** `vulnerability-scanner`
- [ ] Audit all files in `src/app/api/**/*.ts` for missing `verifyTenantAccess`.
- [ ] **Fix**: Apply isolation logic to `/api/checkin`, `/api/analytics`, and `/api/gifts` where missing.
- [ ] **Verify**: Attempt to access Guest B's data with Guest A's `tenantId` and ensure 403/404.

### Phase 2: Evolution API Client (Core - P1)
**Agent:** `backend-specialist` | **Skills:** `api-patterns`
- [ ] Create `src/services/whatsapp/evolution-client.ts`.
- [ ] Implement `sendMessage`, `sendMedia`, and `sendTemplate` methods.
- [ ] Update `src/app/api/webhook/whatsapp` to handle Evolution API webhook format (which differs from Meta's).

### Phase 3: AI Concierge Refinement (Core - P1)
**Agent:** `backend-specialist` | **Skills:** `nodejs-best-practices`
- [ ] Update `AIConcierge` service to use `EvolutionClient` instead of mock logs.
- [ ] Support "Invisible Experience": AI detects if it's a first contact and introduces itself elegantly.
- [ ] Implement RSVP Flow status updates in Evolution API (if supported) or via structured messages.

### Phase 4: Verification & DevOps (Polish - P2)
**Agent:** `test-engineer` | **Skills:** `webapp-testing`
- [ ] Create E2E test script to simulate a full WhatsApp RSVP flow (Mocking Evolution API incoming).
- [ ] Run `security_scan.py` and `lint_runner.py`.
- [ ] Verify `npm run build` succeeds.

## ✅ PHASE X COMPLETE
- Lint: ⏳ Pending
- Security: ⏳ Pending
- Build: ⏳ Pending
- Date: 2026-03-04
