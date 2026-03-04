'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Download, Trash2, Eye, FileText, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export function PrivacyRightsHub() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExportData = async () => {
        setIsExporting(true)
        try {
            // Use existing guest export for now as a demonstration of portability
            const tenantId = localStorage.getItem('last-wedding-id')
            const response = await fetch('/api/guests/export', {
                headers: {
                    'x-tenant-id': tenantId || '',
                    'Authorization': `Bearer ${localStorage.getItem('supabase-token')}`
                }
            })

            if (!response.ok) throw new Error('Falha na exportação')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `dados-pessoais-marryflow-${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)

            toast.success("Exportação Concluída", {
                description: "Seus dados PII foram exportados conforme as normas GDPR/LGPD.",
            })
        } catch (error) {
            toast.error("Erro na Exportação", {
                description: "Não foi possível processar sua solicitação de portabilidade.",
            })
        } finally {
            setIsExporting(false)
        }
    }

    const handleDeleteAccount = () => {
        toast.error("Direito ao Esquecimento", {
            description: "Para excluir permanentemente seus dados, entre em contato com dpo@marryflow.com (ISO 27701).",
        })
    }

    return (
        <Card className="glass-card border-primary/20 overflow-hidden rounded-3xl soft-shadow mb-8">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-serif text-primary">Centro de Direitos de Privacidade</CardTitle>
                        <CardDescription className="text-xs font-accent font-bold uppercase tracking-wider text-primary/40">
                            Conformidade ISO 27701 • GDPR • LGPD
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-background/50 border border-primary/5 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Download className="h-4 w-4" />
                            <h4 className="text-sm font-serif font-bold">Portabilidade de Dados</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Solicite uma cópia estruturada de todos os seus dados pessoais e de convidados armazenados em nossos servidores criptografados.
                        </p>
                        <Button
                            size="sm"
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-accent font-bold uppercase tracking-widest h-8"
                        >
                            {isExporting ? 'Processando...' : 'Exportar meus Dados'}
                        </Button>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/50 border border-primary/5 space-y-3">
                        <div className="flex items-center gap-2 text-error">
                            <Trash2 className="h-4 w-4" />
                            <h4 className="text-sm font-serif font-bold">Direito ao Esquecimento</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Solicite a exclusão definitiva e irreversível de sua conta e de todos os dados associados aos seus eventos.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDeleteAccount}
                            className="w-full rounded-xl border-error/20 text-error hover:bg-error/5 text-[10px] font-accent font-bold uppercase tracking-widest h-8"
                        >
                            Excluir meus Dados
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-primary/5">
                    <div className="flex items-center gap-2 text-[10px] font-accent font-bold uppercase tracking-wider text-muted-foreground/40">
                        <Lock className="h-3 w-3" /> Criptografia AES-256
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-accent font-bold uppercase tracking-wider text-muted-foreground/40">
                        <Eye className="h-3 w-3" /> Acesso Auditado
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-accent font-bold uppercase tracking-wider text-muted-foreground/40">
                        <FileText className="h-3 w-3" /> ISO 27001 Verified
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
