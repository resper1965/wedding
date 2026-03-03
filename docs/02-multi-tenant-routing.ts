// SaaS Routing architecture for Next.js

/**
 * 1. Subdomain Routing vs Path Routing
 *    Path routing (`app.com/[tenantId]/rsvp`) is easier to implement on Vercel free tier.
 *    Subdomain routing (`[tenantId].app.com/rsvp`) requires wildcard DNS and Vercel Pro/Enterprise configs.
 * 
 * 2. Middleware Update:
 *    The `middleware.ts` should intercept the request, extract the `tenantId` from the URL,
 *    validate it against the /Wedding table (via edge-compatible fetch), and inject it into headers
 *    `x-tenant-id` for downstream API routes to consume.
 * 
 * 3. API Isolation (Task 2.3 / Sprint 4):
 *    All API routes in `src/app/api/...` currently do:
 *    `const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()`
 *    
 *    This needs to change to:
 *    `const tenantId = request.headers.get('x-tenant-id')`
 *    `...eq('weddingId', tenantId)`
 *    
 * 4. RLS (Row Level Security):
 *    With Supabase, instead of trusting the API layer to filter `eq('weddingId', id)`, 
 *    the API can set `set_config('app.current_tenant_id', tenantId, true)` 
 *    and the Postgres RLS policies (defined in our migration script) will completely hide
 *    other tenants' data automatically at the database level.
 */
