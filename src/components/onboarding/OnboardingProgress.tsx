'use client'

import { motion } from 'framer-motion'
import { Globe, Users, Grid3X3, MessageSquare, ClipboardList, DollarSign, Briefcase, Gift, ScanLine, BarChart3, Bot, ArrowRight } from 'lucide-react'

interface ProgressStep {
    id: string
    label: string
    description: string
    tab: string
    done: boolean
}

interface OnboardingProgressProps {
    steps: ProgressStep[]
    onNavigate: (tab: string) => void
}

export function OnboardingProgress({ steps, onNavigate }: OnboardingProgressProps) {
    const completed = steps.filter(s => s.done).length
    const total = steps.length
    const percent = Math.round((completed / total) * 100)

    if (completed === total) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-6 backdrop-blur-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-serif font-medium text-foreground">Primeiros Passos</h3>
                    <p className="text-xs text-muted-foreground">{completed} de {total} concluídos</p>
                </div>
                <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            className="text-muted/30"
                            strokeWidth="2"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            className="text-primary"
                            strokeWidth="2"
                            strokeDasharray={`${percent}, 100`}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                        {percent}%
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {steps.filter(s => !s.done).slice(0, 3).map((step, i) => (
                    <button
                        key={step.id}
                        onClick={() => onNavigate(step.tab)}
                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:bg-primary/5 group"
                    >
                        <div className="h-6 w-6 rounded-full border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary/50">
                            {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{step.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </button>
                ))}
            </div>
        </motion.div>
    )
}

export function useOnboardingSteps(dashboardData: {
    totalInvited: number
    partner1Name: string
    partner2Name: string
    venue: string | null
}): ProgressStep[] {
    return [
        {
            id: 'site',
            label: 'Configure seu site',
            description: 'Escolha quais páginas publicar',
            tab: 'my-site',
            done: false, // We can't easily check this without site_pages data
        },
        {
            id: 'guests',
            label: 'Adicione convidados',
            description: `${dashboardData.totalInvited} adicionados`,
            tab: 'guests',
            done: dashboardData.totalInvited > 0,
        },
        {
            id: 'details',
            label: 'Complete os detalhes',
            description: 'Nomes, data e local',
            tab: 'settings',
            done: dashboardData.partner1Name !== 'Novo' && dashboardData.venue !== null && dashboardData.venue !== '',
        },
        {
            id: 'checklist',
            label: 'Organize o checklist',
            description: 'Tarefas do planejamento',
            tab: 'checklist',
            done: false,
        },
    ]
}
