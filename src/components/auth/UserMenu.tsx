'use client'

import { useAuth } from '@/components/auth/SessionProvider'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserMenu() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />
    )
  }

  if (!user) {
    return (
      <Button
        onClick={signIn}
        variant="outline"
        size="sm"
        className="border-stone-200"
      >
        <User className="mr-2 h-4 w-4" />
        Entrar
      </Button>
    )
  }

  const initials = user.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback className="bg-stone-200 text-stone-600 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium text-stone-800">{user.displayName}</p>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={signOut}
          className="text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
