/**
 * Audit Logging Library - MarryFlow (ISO 27001 Compliance)
 * Ensures all access to PII (Personally Identifiable Information) is tracked.
 */

export async function logAudit(
    action: 'ACCESS_LIST' | 'ACCESS_SINGLE' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT',
    actorId: string | null | undefined,
    actorEmail: string | null | undefined,
    resourceType: 'GUEST' | 'USER' | 'WEDDING',
    resourceId: string | null | undefined,
    metadata: any = {}
) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        actor: {
            id: actorId,
            email: actorEmail,
        },
        resource: {
            type: resourceType,
            id: resourceId,
        },
        ...metadata,
    };

    // Log to standard output for cloud log aggregators (ISO 27001 Recommendation)
    console.info(`[AUDIT_LOG] ${JSON.stringify(logEntry)}`);

    // Future: persist to 'AuditLog' table in Supabase if needed
}
