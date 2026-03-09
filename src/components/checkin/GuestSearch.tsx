/**
 * ============================================================================
 * GUEST SEARCH COMPONENT
 * ============================================================================
 * 
 * Manual guest search by name
 * Displays results grouped by family/invitation
 * Click to select for check-in
 * ============================================================================
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Users, Check, Clock, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
export interface GuestSearchResult {
  type: 'guest' | 'invitation'
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  familyName?: string
  checkedIn?: boolean
  checkedInAt?: Date | string | null
  guests?: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
    dietaryRestrictions?: string | null
    specialNeeds?: string | null
  }>
  invitation?: {
    id: string
    familyName: string | null
    checkedIn: boolean
    checkedInAt: Date | string | null
  } | null
  qrToken?: string | null
}

interface GuestSearchProps {
  onGuestSelect: (result: GuestSearchResult) => void
  autoFocus?: boolean
}

// ============================================================================
// GUEST SEARCH COMPONENT
// ============================================================================

export function GuestSearch({ onGuestSelect, autoFocus = false }: GuestSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    guests: GuestSearchResult[]
    invitations: GuestSearchResult[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query)
      } else {
        setResults(null)
        setError(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/checkin?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na busca')
      }

      const data = await response.json()
      setResults({
        guests: data.guests || [],
        invitations: data.invitations || []
      })
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar')
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Format checked-in time
  const formatTime = (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Clear search
  const handleClear = () => {
    setQuery('')
    setResults(null)
    setError(null)
  }

  const totalResults = (results?.guests?.length || 0) + (results?.invitations?.length || 0)

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          className="border-primary/10 bg-card pl-9 pr-9 focus:border-primary/40"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {isLoading && (
          <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            Buscando...
          </Badge>
        )}
        {!isLoading && query.length >= 2 && results && (
          <Badge variant="outline" className="border-primary/20 text-primary/60 font-semibold tracking-wide uppercase text-[10px]">
            {totalResults} resultado{totalResults !== 1 ? 's' : ''}
          </Badge>
        )}
        {!isLoading && error && (
          <Badge variant="outline" className="gap-1 border-accent/20 text-accent">
            {error}
          </Badge>
        )}
      </div>

      {/* Results */}
      <ScrollArea className="max-h-[60vh]">
        <AnimatePresence mode="popLayout">
          {results && totalResults === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <User className="mx-auto h-10 w-10 text-stone-300" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhum convidado encontrado</p>
              <p className="text-xs text-muted-foreground">Tente outro nome</p>
            </motion.div>
          )}

          {/* Invitations/Families */}
          {results?.invitations?.map((invitation, index) => (
            <motion.button
              key={invitation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onGuestSelect(invitation)}
              className="mb-2 w-full rounded-2xl border border-primary/10 bg-card p-5 text-left transition-all hover:bg-primary/5 soft-shadow"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${invitation.checkedIn
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gradient-to-br from-primary/5 to-primary/5 text-primary/80'
                  }`}>
                  {invitation.checkedIn ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-stone-800">
                      {invitation.familyName || 'Família'}
                    </p>
                    {invitation.checkedIn && (
                      <Badge className="bg-primary/10 text-[10px] font-bold tracking-wide uppercase text-primary border-none">
                        Check-in
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {invitation.guests?.length || 0} convidado{(invitation.guests?.length || 0) !== 1 ? 's' : ''}
                    {invitation.checkedIn && invitation.checkedInAt && (
                      <span className="ml-2 text-primary">
                        às {formatTime(invitation.checkedInAt)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-emerald-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Guest List Preview */}
              {invitation.guests && invitation.guests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {invitation.guests.slice(0, 4).map((g) => (
                    <Badge key={g.id} variant="secondary" className="text-xs">
                      {g.firstName}
                    </Badge>
                  ))}
                  {invitation.guests.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{invitation.guests.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </motion.button>
          ))}

          {/* Individual Guests */}
          {results?.guests?.map((guest, index) => (
            <motion.button
              key={guest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: (results.invitations?.length || 0 + index) * 0.03 }}
              onClick={() => onGuestSelect(guest)}
              className="mb-2 w-full rounded-2xl border border-emerald-100 bg-card p-5 text-left transition-all hover:bg-primary/5/50 soft-shadow"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold ${guest.invitation?.checkedIn
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gradient-to-br from-primary/5 to-primary/5 text-primary/80'
                  }`}>
                  {guest.invitation?.checkedIn ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    guest.firstName?.[0] || guest.fullName?.[0] || '?'
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-bold ${guest.invitation?.checkedIn ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                    {guest.fullName || `${guest.firstName} ${guest.lastName}`}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {guest.invitation?.familyName || 'Sem grupo'}
                    {guest.invitation?.checkedIn && guest.invitation.checkedInAt && (
                      <span className="ml-3 flex items-center text-primary">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(guest.invitation.checkedInAt)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-emerald-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}

export default GuestSearch
