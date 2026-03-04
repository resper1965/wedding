export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'
import { generateObsidianVault } from '@/lib/export-obsidian'

export async function GET(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id')
        const auth = await verifySupabaseToken(request)

        // Auth-Tenant RBAC Check
        const access = await verifyTenantAccess(tenantId!, auth.uid, auth.email)
        if (!access.hasAccess || !access.weddingId) return access.response!

        // Generate the ZIP buffer
        const zipBuffer = await generateObsidianVault(access.weddingId)

        // Return the ZIP file as a downloadable response
        return new NextResponse(zipBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="marryflow-obsidian-vault-${access.weddingId.substring(0, 8)}.zip"`,
            },
        })
    } catch (error) {
        console.error('Error exporting Obsidian vault:', error)
        return NextResponse.json({ success: false, error: 'Erro ao gerar o vault do Obsidian' }, { status: 500 })
    }
}
