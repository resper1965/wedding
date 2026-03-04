'use client'

import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Users, Check, AlertCircle, RefreshCw, Trash2, Edit2,
  Circle, Square, RectangleHorizontal, Grid3X3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Guest {
  id: string
  firstName: string
  lastName: string
  confirmed: boolean
}

interface Group {
  id: string
  name: string
  guests: Guest[]
}

interface Table {
  id: string
  name: string
  capacity: number
  shape: 'round' | 'rectangular' | 'square'
  positionX: number | null
  positionY: number | null
  notes: string | null
  groups: Group[]
  occupiedSeats: number
}

interface SeatingData {
  tables: Table[]
  unassignedGroups: Group[]
}

export function SeatingPlanner() {
  const { toast } = useToast()
  const [data, setData] = useState<SeatingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showNewTableDialog, setShowNewTableDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [newTableName, setNewTableName] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(8)
  const [newTableShape, setNewTableShape] = useState<'round' | 'rectangular' | 'square'>('round')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authFetch('/api/tables')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mesas',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createTable = async () => {
    try {
      const response = await authFetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTableName,
          capacity: newTableCapacity,
          shape: newTableShape
        })
      })
      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Mesa criada',
          description: `Mesa "${result.data.name}" criada com sucesso`
        })
        setShowNewTableDialog(false)
        setNewTableName('')
        setNewTableCapacity(8)
        setNewTableShape('round')
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a mesa',
        variant: 'destructive'
      })
    }
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mesa? Os grupos serão desassociados.')) {
      return
    }
    try {
      const response = await fetch(`/api/tables/${tableId}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Mesa excluída',
          description: 'Mesa excluída com sucesso'
        })
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a mesa',
        variant: 'destructive'
      })
    }
  }

  const assignGroup = async (groupId: string, tableId: string | null) => {
    try {
      const response = await authFetch('/api/groups/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, tableId })
      })
      const result = await response.json()
      if (result.success) {
        toast({
          title: tableId ? 'Grupo alocado' : 'Grupo removido',
          description: tableId ? 'Grupo alocado à mesa com sucesso' : 'Grupo removido da mesa'
        })
        fetchData()
        setSelectedGroup(null)
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alocar o grupo',
        variant: 'destructive'
      })
    }
  }

  const updateTable = async () => {
    if (!editingTable) return
    try {
      const response = await fetch(`/api/tables/${editingTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTable.name,
          capacity: editingTable.capacity,
          shape: editingTable.shape
        })
      })
      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Mesa atualizada',
          description: 'Mesa atualizada com sucesso'
        })
        setShowEditDialog(false)
        setEditingTable(null)
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a mesa',
        variant: 'destructive'
      })
    }
  }

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'round':
        return <Circle className="h-5 w-5" />
      case 'square':
        return <Square className="h-5 w-5" />
      case 'rectangular':
        return <RectangleHorizontal className="h-5 w-5" />
      default:
        return <Circle className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
        <p className="ml-2 text-muted-foreground">Erro ao carregar dados</p>
      </div>
    )
  }

  const totalConfirmed = data.tables.reduce(
    (acc, t) => acc + t.occupiedSeats,
    0
  ) + data.unassignedGroups.reduce(
    (acc, g) => acc + g.guests.filter(guest => guest.confirmed).length,
    0
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Main Area - Tables Grid */}
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card/50 soft-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mesas</p>
                  <p className="text-2xl font-semibold text-foreground">{data.tables.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 soft-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alocados</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {data.tables.reduce((acc, t) => acc + t.occupiedSeats, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 soft-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-error/10 p-2">
                  <Users className="h-5 w-5 text-error" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sem lugar</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {data.unassignedGroups.reduce((acc, g) => acc + g.guests.filter(guest => guest.confirmed).length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Mesas</h2>
          <Button
            onClick={() => setShowNewTableDialog(true)}
            size="sm"
            className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Nova Mesa
          </Button>
        </div>

        {data.tables.length === 0 ? (
          <Card className="border-dashed border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Grid3X3 className="h-12 w-12 text-primary/30" />
              <p className="mt-4 text-muted-foreground">Nenhuma mesa criada</p>
              <Button
                onClick={() => setShowNewTableDialog(true)}
                variant="outline"
                className="mt-4 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira mesa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.tables.map((table) => (
                <motion.div
                  key={table.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md bg-card/50",
                      selectedGroup && table.occupiedSeats < table.capacity
                        ? "border-success ring-2 ring-success/10"
                        : "border-border"
                    )}
                    onClick={() => {
                      if (selectedGroup) {
                        assignGroup(selectedGroup.id, table.id)
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          {getShapeIcon(table.shape)}
                          {table.name}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingTable(table)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/50 hover:text-error hover:bg-error/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTable(table.id)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ocupação</span>
                        <span className={cn(
                          "font-medium",
                          table.occupiedSeats > table.capacity ? "text-error" : "text-foreground"
                        )}>
                          {table.occupiedSeats} / {table.capacity}
                        </span>
                      </div>
                      <Progress
                        value={(table.occupiedSeats / table.capacity) * 100}
                        className={cn(
                          "h-2",
                          table.occupiedSeats > table.capacity ? "[&>div]:bg-error" : "[&>div]:bg-primary"
                        )}
                      />

                      {table.groups.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {table.groups.map((group) => (
                            <div
                              key={group.id}
                              className="flex items-center justify-between rounded-lg bg-muted/30 p-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-foreground">{group.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {group.guests.filter(g => g.confirmed).length} confirmados
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-error hover:bg-error/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  assignGroup(group.id, null)
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedGroup && table.occupiedSeats < table.capacity && (
                        <div className="rounded-lg border-2 border-dashed border-success/30 bg-success/5 p-2 text-center text-sm text-success">
                          Clique para alocar "{selectedGroup.name}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sidebar - Unassigned Groups */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <Card className="border-border bg-card/50 soft-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Grupos sem Mesa</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {data.unassignedGroups.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground/40">
                  <Check className="mx-auto h-8 w-8 text-success/50" />
                  <p className="mt-2">Todos os grupos alocados!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.unassignedGroups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
                      className={cn(
                        "cursor-pointer rounded-lg border p-3 transition-all",
                        selectedGroup?.id === group.id
                          ? "border-success bg-success/5 ring-2 ring-success/10"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{group.name}</p>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-none">
                          {group.guests.filter(g => g.confirmed).length} pessoas
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.guests.map(g => `${g.firstName} ${g.lastName}`).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedGroup && (
              <div className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                <p className="font-medium">Grupo selecionado:</p>
                <p className="mt-1">{selectedGroup.name}</p>
                <p className="mt-2 text-xs text-primary/70">
                  Clique em uma mesa com vagas disponíveis para alocar
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-xs hover:bg-primary/10"
                  onClick={() => setSelectedGroup(null)}
                >
                  Cancelar seleção
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Table Dialog */}
      <Dialog open={showNewTableDialog} onOpenChange={setShowNewTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Mesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Mesa</Label>
              <Input
                id="name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Ex: Mesa 1, Mesa dos Noivos..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min={2}
                max={20}
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 8)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shape">Formato</Label>
              <Select value={newTableShape} onValueChange={(v) => setNewTableShape(v as typeof newTableShape)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Redonda</SelectItem>
                  <SelectItem value="rectangular">Retangular</SelectItem>
                  <SelectItem value="square">Quadrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTableDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createTable} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Criar Mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mesa</DialogTitle>
          </DialogHeader>
          {editingTable && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Mesa</Label>
                <Input
                  id="edit-name"
                  value={editingTable.name}
                  onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacidade</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min={2}
                  max={20}
                  value={editingTable.capacity}
                  onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-shape">Formato</Label>
                <Select
                  value={editingTable.shape}
                  onValueChange={(v) => setEditingTable({ ...editingTable, shape: v as 'round' | 'rectangular' | 'square' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Redonda</SelectItem>
                    <SelectItem value="rectangular">Retangular</SelectItem>
                    <SelectItem value="square">Quadrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateTable} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
