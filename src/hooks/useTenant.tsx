'use client'

import { createContext, useContext, ReactNode } from 'react'

interface TenantContextType {
    tenantId: string
}

const TenantContext = createContext<TenantContextType>({ tenantId: '' })

export function useTenant() {
    const ctx = useContext(TenantContext)
    if (!ctx.tenantId) {
        throw new Error('useTenant must be used within a TenantProvider (inside /evento/[tenantId]/*)')
    }
    return ctx
}

export function TenantProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
    return (
        <TenantContext.Provider value= {{ tenantId }
}>
    { children }
    </TenantContext.Provider>
  )
}
