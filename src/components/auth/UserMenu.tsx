'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
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
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />
    )
  }

  if (!session) {
    return (
      <Button
        onClick={() => signIn('google')}
        variant="outline"
        size="sm"
        className="border-stone-200"
      >
        <User className="mr-2 h-4 w-4" />
        Entrar
      </Button>
    )
  }

  const initials = session.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
            <AvatarFallback className="bg-stone-200 text-stone-600 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium text-stone-800">{session.user?.name}</p>
          <p className="text-xs text-stone-500">{session.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
