import { TenantProvider } from '@/hooks/useTenant'

/**
 * Layout para todas as rotas dentro de /evento/[tenantId]/*
 * Injeta o tenantId via React Context para todas as páginas filhas.
 */
export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ tenantId: string }>
}) {
    const { tenantId } = await params

    return (
        <TenantProvider tenantId={tenantId}>
            {children}
        </TenantProvider>
    )
}
