'use client'

import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellOff,
  Send,
  Calendar,
  Users,
  Clock,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================================================
// TYPES
// ============================================================================

interface ReminderConfig {
  id: string
  enabled: boolean
  firstReminderDays: number
  secondReminderDays: number
  finalReminderDays: number
  customMessage: string | null
}

interface ReminderStats {
  pendingGuests: number
  daysUntilWedding: number
  nextReminderDate: Date | null
  nextReminderType: 'first' | 'second' | 'final' | null
  remindersSent: {
    first: number
    second: number
    final: number
  }
}

interface UpcomingReminder {
  type: 'first' | 'second' | 'final'
  date: Date
  daysBefore: number
  pendingGuests: number
}

interface ReminderSettingsProps {
  weddingId: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReminderSettings({ weddingId }: ReminderSettingsProps) {
  const [config, setConfig] = useState<ReminderConfig | null>(null)
  const [stats, setStats] = useState<ReminderStats | null>(null)
  const [upcoming, setUpcoming] = useState<UpcomingReminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    enabled: true,
    firstReminderDays: 30,
    secondReminderDays: 7,
    finalReminderDays: 2,
    customMessage: ''
  })

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/reminders?weddingId=${weddingId}`)
      const data = await response.json()

      if (data.success) {
        setConfig(data.data.config)
        setStats(data.data.stats)
        setUpcoming(data.data.upcoming)

        // Set form data from config
        setFormData({
          enabled: data.data.config.enabled,
          firstReminderDays: data.data.config.firstReminderDays,
          secondReminderDays: data.data.config.secondReminderDays,
          finalReminderDays: data.data.config.finalReminderDays,
          customMessage: data.data.config.customMessage || ''
        })
      }
    } catch (error) {
      console.error('Error fetching reminder data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [weddingId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Save configuration
  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await authFetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        setConfig(data.data)
        await fetchData()
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Send manual reminder
  const handleSendReminder = async (type: 'first' | 'second' | 'final') => {
    if (!confirm(`Enviar lembrete para ${stats?.pendingGuests || 0} convidados pendentes?`)) {
      return
    }

    setIsSending(type)
    setLastResult(null)

    try {
      const response = await authFetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          reminderType: type
        })
      })

      const data = await response.json()

      if (data.success) {
        setLastResult({
          sent: data.data.sent,
          failed: data.data.failed
        })
        await fetchData()
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
    } finally {
      setIsSending(null)
    }
  }

  // Get reminder type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      first: 'Primeiro Lembrete',
      second: 'Segundo Lembrete',
      final: 'Lembrete Final'
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <Card className="border-amber-100/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card className="border-amber-100/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg font-medium text-stone-800">
                Lembretes Automáticos
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enabled" className="text-sm text-stone-500">
                {formData.enabled ? 'Ativado' : 'Desativado'}
              </Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
          </div>
          <CardDescription>
            Configure os lembretes automáticos para convidados que ainda não responderam
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">{stats.daysUntilWedding}</p>
                <p className="text-xs text-stone-500">dias para o casamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.pendingGuests}</p>
                <p className="text-xs text-stone-500">pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.remindersSent.first + stats.remindersSent.second + stats.remindersSent.final}</p>
                <p className="text-xs text-stone-500">lembretes enviados</p>
              </div>
              <div className="text-center">
                {stats.nextReminderDate ? (
                  <>
                    <p className="text-lg font-bold text-stone-700">
                      {format(new Date(stats.nextReminderDate), 'd MMM', { locale: ptBR })}
                    </p>
                    <p className="text-xs text-stone-500">próximo lembrete</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl text-stone-300">—</p>
                    <p className="text-xs text-stone-400">sem lembretes</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reminder Days Configuration */}
          <div className={`space-y-4 ${!formData.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h4 className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Configuração de Dias
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstReminderDays" className="text-stone-600">
                  Primeiro Lembrete
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="firstReminderDays"
                    type="number"
                    min={1}
                    value={formData.firstReminderDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstReminderDays: parseInt(e.target.value) || 30 }))}
                    className="w-20"
                  />
                  <span className="text-sm text-stone-500">dias antes</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondReminderDays" className="text-stone-600">
                  Segundo Lembrete
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondReminderDays"
                    type="number"
                    min={1}
                    value={formData.secondReminderDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondReminderDays: parseInt(e.target.value) || 7 }))}
                    className="w-20"
                  />
                  <span className="text-sm text-stone-500">dias antes</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalReminderDays" className="text-stone-600">
                  Lembrete Final
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="finalReminderDays"
                    type="number"
                    min={0}
                    value={formData.finalReminderDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, finalReminderDays: parseInt(e.target.value) || 2 }))}
                    className="w-20"
                  />
                  <span className="text-sm text-stone-500">dias antes</span>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="customMessage" className="text-stone-600">
                Mensagem Personalizada (opcional)
              </Label>
              <Textarea
                id="customMessage"
                value={formData.customMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                placeholder="Adicione uma mensagem personalizada que será incluída nos lembretes..."
                rows={3}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reminders Card */}
      <Card className="border-amber-100/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg font-medium text-stone-800">
              Próximos Lembretes
            </CardTitle>
          </div>
          <CardDescription>
            Visualize e envie lembretes manualmente
          </CardDescription>
        </CardHeader>

        <CardContent>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200"
            >
              <p className="text-sm text-green-700">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                {lastResult.sent} lembrete(s) enviado(s) com sucesso
                {lastResult.failed > 0 && `, ${lastResult.failed} falharam`}
              </p>
            </motion.div>
          )}

          {upcoming.length === 0 ? (
            <div className="text-center py-6 text-stone-500">
              <BellOff className="h-10 w-10 mx-auto mb-2 text-stone-300" />
              <p>Nenhum lembrete programado</p>
              {stats && stats.pendingGuests === 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Todos os convidados já responderam!
                </p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                <AnimatePresence>
                  {upcoming.map((reminder) => (
                    <motion.div
                      key={`${reminder.type}-${reminder.daysBefore}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:border-amber-200 bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-700">
                            {getTypeLabel(reminder.type)}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-stone-500">
                            <span>
                              {format(new Date(reminder.date), "d 'de' MMMM", { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {reminder.pendingGuests} pendentes
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(reminder.type)}
                        disabled={isSending !== null || (stats?.pendingGuests || 0) === 0}
                        className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        {isSending === reminder.type ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}

          {/* Manual Send Section */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-500 mb-3">
              Envio manual de lembretes:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReminder('first')}
                disabled={isSending !== null || (stats?.pendingGuests || 0) === 0}
                className="border-stone-200"
              >
                {isSending === 'first' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Primeiro
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReminder('second')}
                disabled={isSending !== null || (stats?.pendingGuests || 0) === 0}
                className="border-stone-200"
              >
                {isSending === 'second' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Segundo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReminder('final')}
                disabled={isSending !== null || (stats?.pendingGuests || 0) === 0}
                className="border-stone-200"
              >
                {isSending === 'final' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Final
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Como funcionam os lembretes?</p>
              <ul className="text-blue-600 space-y-1 list-disc list-inside">
                <li>Os lembretes são enviados automaticamente nas datas configuradas</li>
                <li>Apenas convidados com email cadastrado recebem lembretes</li>
                <li>Convidados que já confirmaram não recebem lembretes</li>
                <li>Você pode enviar lembretes manualmente a qualquer momento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
