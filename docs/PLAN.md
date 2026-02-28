# Orchestration Plan: SaaS Multi-Tenant Conversion

**Goal:** Transform the single-event wedding app into a Multi-Tenant SaaS platform with self-service registration, subscription tiers, and a SuperAdmin dashboard. Guests interact exclusively via WhatsApp.
**Mode:** ORCHESTRATION (Phase 1)
**Orchestrator:** Antigravity

## Architectural Decisions based on Socratic Review
1. **P0 (Mapping): Self-Service.** Couples sign up, creating a User and their own Wedding instance automatically.
2. **P1 (Finance): SaaS Tiers.** We need a subscription model (e.g., Free, Premium) enforced at the DB and API levels.
3. **P2 (Guest UX): WhatsApp Only.** Guests do not log in. Web app is strictly for Admins and Couples.

---

## Task Breakdown & Agent Assignments

The execution will be fully parallelized across specialized agents once this plan is approved.

### 1. Database & Multi-Tenancy (Foundation)
**Assigned Agents:** `@database-architect`, `@security-auditor`
- **Schema Updates:** 
  - Create `WeddingUser` junction table to map Auth Users to Weddings with roles (owner, editor).
  - Add `subscriptionTier` (e.g., 'free', 'pro', 'premium') and `stripeCustomerId` to the `Wedding` table.
  - Create `PlatformAdmin` role in `profiles` for SuperAdmin access.
- **RLS Policies:** Rewrite all RLS policies. Instead of `is_admin_or_editor()`, policies must verify if the user belongs to the specific `weddingId` via the `WeddingUser` table. SuperAdmins bypass this.
- **Migration Script:** Generate and verify `006_saas_multi_tenant.sql`.

### 2. Backend & API Scoping (Core)
**Assigned Agents:** `@backend-specialist`, `@security-auditor`
- **Context Injection:** Update all `/api/*` routes to extract the `weddingId` from the authenticated user's context (or headers) and strictly filter queries. A user must NEVER be able to query RSVPs from another wedding.
- **Subscription Middleware:** Create helpers to check if a Wedding's `subscriptionTier` allows access to premium features (e.g., AI Agent, custom WhatsApp templates).
- **Guest API:** Ensure all guest-facing APIs (like RSVP links) remain public but rate-limited, relying on secure tokens instead of auth.

### 3. Frontend & Self-Service Flow (Core)
**Assigned Agents:** `@frontend-specialist`
- **Onboarding Flow:** Create `/register` and `/onboarding` pages. When a user signs up, prompt for "Partner Names" and "Wedding Date" to automatically bootstrap their `Wedding` record.
- **Context Provider:** Create a `WeddingProvider` React context to store the active `weddingId` and pass it to all API calls.
- **SuperAdmin Dashboard:** Create `/admin` route (protected) to list all weddings, view metrics (total couples, MRR), and manage bans/tiers.

### 4. Billing & DevOps (Polish)
**Assigned Agents:** `@devops-engineer`
- **Stripe Integration (Stub):** Prepare webhooks and API routes for Stripe Checkout completion to upgrade a wedding's `subscriptionTier`.
- **Environment Setup:** Ensure Vercel environment variables are ready for the SaaS scale.

---

## 🛑 User Approval Required

**Do you approve this SaaS conversion orchestration plan? (Y/N)**
- **Y**: I will dispatch the specialized agents (`database-architect`, `backend-specialist`, `frontend-specialist`) to begin the implementation phase in parallel.
- **N**: Let me know what to change or remove.
