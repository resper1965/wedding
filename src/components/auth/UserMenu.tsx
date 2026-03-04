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
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/5" />
    )
  }

  if (!user) {
    return (
      <Button
        onClick={() => signIn('', '')}
        variant="outline"
        className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px]"
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
        <Button variant="ghost" className="relative h-10 w-10 rounded-2xl p-0 transition-transform hover:scale-105 active:scale-95">
          <Avatar className="h-10 w-10 rounded-2xl border border-primary/10 shadow-sm">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-serif font-bold rounded-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-2xl border-primary/10 bg-background/80 backdrop-blur-xl p-2 shadow-2xl" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-3">
          <p className="text-sm font-serif font-bold text-foreground leading-none">{user.displayName}</p>
          <p className="text-[10px] font-accent font-bold uppercase tracking-wider text-muted-foreground/40 mt-1">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-primary/5 mx-2" />
        <DropdownMenuItem
          onClick={signOut}
          className="text-error focus:bg-error/5 focus:text-error rounded-xl p-3 font-accent font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair da Conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
