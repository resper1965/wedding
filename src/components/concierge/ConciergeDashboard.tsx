'use client'

import { useState, useEffect } from 'react'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  QrCode,
  Send,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Copy,
  RefreshCw,
  Settings,
  Image as ImageIcon,
  Bot
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

interface ConciergeStats {
  totalConversations: number
  activeFlows: number
  confirmedToday: number
  pendingResponse: number
  qrCodesGenerated: number
  checkInsToday: number
}

interface Conversation {
  id: string
  familyName: string | null
  phone: string
  lastMessage: string
  lastMessageAt: string | null
  flowStatus: string
  messageCount: number
}

interface GeneratedQR {
  invitationId: string
  familyName: string
  qrDataUrl: string
}

// ============================================================================
// CONCIERGE DASHBOARD COMPONENT
// ============================================================================

export function ConciergeDashboard() {
  const { tenantId } = useTenant()
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'qrcode' | 'media' | 'settings'>('overview')
  const [stats, setStats] = useState<ConciergeStats | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // QR Code generation state
  const [qrFamilyName, setQrFamilyName] = useState('')
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null)

  // Media generation state
  const [mediaFamilyName, setMediaFamilyName] = useState('')
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null)

  // Test message state
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')

  // Fetch data on mount
  useEffect(() => {
    fetchConciergeData()
  }, [])

  const fetchConciergeData = async () => {
    setIsLoading(true)
    try {
      // Fetch stats
      const statsRes = await tenantFetch('/api/concierge/stats', tenantId)
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      // Fetch conversations
      const convRes = await tenantFetch('/api/concierge/conversations', tenantId)
      if (convRes.ok) {
        const data = await convRes.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching concierge data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async () => {
    if (!qrFamilyName.trim()) {
      toast.error('Digite o nome da família')
      return
    }

    try {
      const res = await tenantFetch('/api/concierge/qrcode', tenantId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName: qrFamilyName })
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedQR(data)
        toast.success('QR Code gerado com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao gerar QR Code')
      }
    } catch (error) {
      toast.error('Erro ao gerar QR Code')
    }
  }

  const generateMedia = async () => {
    if (!mediaFamilyName.trim()) {
      toast.error('Digite o nome da família')
      return
    }

    try {
      const res = await tenantFetch('/api/concierge/media', tenantId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName: mediaFamilyName })
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedMediaUrl(data.publicUrl)
        toast.success('Convite gerado com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao gerar convite')
      }
    } catch (error) {
      toast.error('Erro ao gerar convite')
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      toast.error('Preencha o telefone e a mensagem')
      return
    }

    try {
      const res = await tenantFetch('/api/concierge/send', tenantId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMessage })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Mensagem enviada!')
        setTestMessage('')
      } else {
        toast.error(data.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Bot },
          { id: 'conversations', label: 'Conversas', icon: MessageSquare },
          { id: 'qrcode', label: 'QR Codes', icon: QrCode },
          { id: 'media', label: 'Convites', icon: ImageIcon },
          { id: 'settings', label: 'Configurações', icon: Settings }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                title="Conversas"
                value={stats?.totalConversations || 0}
                icon={MessageSquare}
                color="amber"
              />
              <StatCard
                title="Fluxos Ativos"
                value={stats?.activeFlows || 0}
                icon={RefreshCw}
                color="blue"
              />
              <StatCard
                title="Confirmados Hoje"
                value={stats?.confirmedToday || 0}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Aguardando"
                value={stats?.pendingResponse || 0}
                icon={Clock}
                color="orange"
              />
              <StatCard
                title="QRs Gerados"
                value={stats?.qrCodesGenerated || 0}
                icon={QrCode}
                color="cyan"
              />
              <StatCard
                title="Check-ins Hoje"
                value={stats?.checkInsToday || 0}
                icon={Users}
                color="rose"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <CardDescription>Ações comuns do Concierge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveTab('qrcode')}
                  >
                    <QrCode className="h-5 w-5 text-accent" />
                    <span>Gerar QR Code</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveTab('media')}
                  >
                    <ImageIcon className="h-5 w-5 text-destructive" />
                    <span>Criar Convite</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={fetchConciergeData}
                  >
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <span>Atualizar Dados</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span>Configurar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="border-accent/20 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">AI Concierge Ativo</p>
                    <p className="text-sm text-accent">
                      Processando mensagens com GPT-4o • RAG Context habilitado
                    </p>
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <motion.div
            key="conversations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversas Recentes</CardTitle>
                <CardDescription>
                  Últimas interações via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                    <p>Nenhuma conversa ainda</p>
                    <p className="text-sm">As conversas aparecerão aqui quando os convidados enviarem mensagens</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-stone-100 hover:bg-muted transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-medium">
                          {conv.familyName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">
                              {conv.familyName || 'Desconhecido'}
                            </p>
                            <Badge variant="outline" className="shrink-0">
                              {conv.flowStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleString('pt-BR')
                              : 'Sem mensagens'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Message */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enviar Mensagem de Teste</CardTitle>
                <CardDescription>
                  Teste a integração com WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Número do WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="+55 11 99999-9999"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Digite sua mensagem..."
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={sendTestMessage} className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qrcode' && (
          <motion.div
            key="qrcode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gerar QR Code</CardTitle>
                <CardDescription>
                  QR Code para check-in no evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="familyName">Nome da Família</Label>
                  <Input
                    id="familyName"
                    placeholder="Ex: Família Silva"
                    value={qrFamilyName}
                    onChange={e => setQrFamilyName(e.target.value)}
                  />
                </div>
                <Button onClick={generateQRCode} className="gap-2 w-full">
                  <QrCode className="h-4 w-4" />
                  Gerar QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedQR ? (
                  <div className="space-y-4">
                    <div className="flex justify-center p-4 bg-card rounded-lg border">
                      <img
                        src={generatedQR.qrDataUrl}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{generatedQR.familyName}</p>
                      <p className="text-sm text-muted-foreground">
                        Válido por 30 dias
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedQR.qrDataUrl)
                        toast.success('QR Code copiado!')
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <QrCode className="mx-auto h-16 w-16 text-stone-300 mb-3" />
                    <p>Configure os dados e clique em gerar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <motion.div
            key="media"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gerar Convite Personalizado</CardTitle>
                <CardDescription>
                  Imagem de convite com nome da família
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="mediaFamilyName">Nome da Família</Label>
                  <Input
                    id="mediaFamilyName"
                    placeholder="Ex: Família Silva"
                    value={mediaFamilyName}
                    onChange={e => setMediaFamilyName(e.target.value)}
                  />
                </div>
                <Button onClick={generateMedia} className="gap-2 w-full">
                  <ImageIcon className="h-4 w-4" />
                  Gerar Convite
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convite Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedMediaUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center p-2 bg-muted rounded-lg">
                      <img
                        src={generatedMediaUrl}
                        alt="Convite"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + generatedMediaUrl)
                        toast.success('URL do convite copiada!')
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar URL
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="mx-auto h-16 w-16 text-stone-300 mb-3" />
                    <p>Configure os dados e clique em gerar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações do WhatsApp</CardTitle>
                <CardDescription>
                  Configure a integração com WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/whatsapp`}
                        className="bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/webhook/whatsapp`)
                          toast.success('URL copiada!')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure esta URL no Meta Business Suite
                    </p>
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <Label>Verify Token</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value="wedding_concierge_2025"
                        className="bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText('wedding_concierge_2025')
                          toast.success('Token copiado!')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use este token ao configurar o webhook
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variáveis de Ambiente Necessárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div className="p-2 bg-muted rounded">
                    <code>WHATSAPP_ACCESS_TOKEN</code>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <code>WHATSAPP_PHONE_NUMBER_ID</code>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <code>WHATSAPP_VERIFY_TOKEN</code>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <code>JWT_SECRET</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: number
  icon: React.ElementType
  color: 'amber' | 'blue' | 'green' | 'orange' | 'cyan' | 'rose'
}) {
  const colorClasses = {
    amber: 'bg-accent/5 text-accent border-accent/20',
    blue: 'bg-primary/5 text-primary border-primary/20',
    green: 'bg-primary/5 text-primary border-primary/20',
    orange: 'bg-accent/5 text-accent border-accent/20',
    cyan: 'bg-primary/5 text-cyan-600 border-cyan-200',
    rose: 'bg-destructive/5 text-destructive border-destructive/20'
  }

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-xs opacity-80 mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}
