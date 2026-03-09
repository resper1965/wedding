import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TenantProvider, useTenant } from '@/hooks/useTenant'

// Test component to consume the context
function TenantDisplay() {
    const { tenantId } = useTenant()
    return <div data-testid="tenant-id">{tenantId}</div>
}

describe('useTenant', () => {
    describe('TenantProvider', () => {
        it('should provide tenantId to children', () => {
            render(
                <TenantProvider tenantId="test-uuid-123">
                    <TenantDisplay />
                </TenantProvider>
            )

            expect(screen.getByTestId('tenant-id')).toHaveTextContent('test-uuid-123')
        })

        it('should provide different tenantIds for different providers', () => {
            const { unmount } = render(
                <TenantProvider tenantId="tenant-a">
                    <TenantDisplay />
                </TenantProvider>
            )

            expect(screen.getByTestId('tenant-id')).toHaveTextContent('tenant-a')
            unmount()

            render(
                <TenantProvider tenantId="tenant-b">
                    <TenantDisplay />
                </TenantProvider>
            )

            expect(screen.getByTestId('tenant-id')).toHaveTextContent('tenant-b')
        })
    })

    describe('useTenant hook', () => {
        it('should throw when used outside TenantProvider', () => {
            // Suppress console.error for expected error
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            expect(() => render(<TenantDisplay />)).toThrow(
                'useTenant must be used within a TenantProvider'
            )

            consoleSpy.mockRestore()
        })
    })
})
