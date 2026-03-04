'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
    className?: string
    link?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
    withDot?: boolean
}

export function BrandLogo({
    className,
    link = true,
    size = 'md',
    withDot = true
}: BrandLogoProps) {
    const sizeClasses = {
        sm: {
            marry: 'text-xl',
            flow: 'text-lg',
            dot: 'text-lg'
        },
        md: {
            marry: 'text-2xl',
            flow: 'text-xl',
            dot: 'text-xl'
        },
        lg: {
            marry: 'text-3xl',
            flow: 'text-2xl',
            dot: 'text-2xl'
        },
        xl: {
            marry: 'text-4xl',
            flow: 'text-3xl',
            dot: 'text-3xl'
        },
        hero: {
            marry: 'text-[clamp(3.5rem,6vw,5.5rem)]',
            flow: 'text-[clamp(2.5rem,5vw,4.5rem)]',
            dot: 'text-[clamp(2.5rem,5vw,4.5rem)]'
        }
    }

    const content = (
        <div className={cn("flex items-center gap-1.5 select-none transition-all hover:scale-105 active:scale-95 group", className)}>
            <span className={cn(
                "font-script text-[oklch(0.25_0.03_160)] drop-shadow-sm transition-colors group-hover:text-primary",
                sizeClasses[size].marry
            )}>
                Marry
            </span>
            <div className="flex flex-col items-center mt-1">
                <span className={cn(
                    "font-serif italic font-medium tracking-[0.1em] text-foreground/80 lowercase",
                    sizeClasses[size].flow
                )}>
                    Flow
                </span>
                <div className="h-0.5 w-full bg-primary/20 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
            {withDot && (
                <div className={cn(
                    "h-1.5 w-1.5 rounded-full bg-primary mt-2 shadow-[0_0_8px_oklch(0.25_0.03_160_/_0.3)]",
                    // Use sizeClasses to adjust dot scale if needed
                )} />
            )}
        </div>
    )

    if (link) {
        return (
            <Link href="/">
                {content}
            </Link>
        )
    }

    return content
}
