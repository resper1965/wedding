'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Mail, MessageCircle, Smartphone, MoreVertical, 
  Pencil, Trash2, Copy, Eye, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TemplatePreview } from './TemplatePreview'

interface Template {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  subject: string | null
  content: string
  variables: string | null
  thumbnail: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TemplateListProps {
  templates: Template[]
  onEdit: (template: Template) => void
  onDelete: (id: string) => Promise<void>
  onDuplicate: (template: Template) => Promise<void>
  onCreateNew: () => void
}

export function TemplateList({ 
  templates, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onCreateNew 
}: TemplateListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      case 'sms': return <Smartphone className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-primary/10 text-primary border-primary/20'
      case 'whatsapp': return 'bg-primary/10 text-primary border-primary/20'
      case 'sms': return 'bg-purple-100 text-primary border-purple-200'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email'
      case 'whatsapp': return 'WhatsApp'
      case 'sms': return 'SMS'
      default: return type
    }
  }

  const parseVariables = (variables: string | null): string[] => {
    if (!variables) return []
    try {
      return JSON.parse(variables)
    } catch {
      return []
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await onDelete(deleteId)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleDuplicate = async (template: Template) => {
    setIsDuplicating(template.id)
    try {
      await onDuplicate(template)
    } finally {
      setIsDuplicating(null)
    }
  }

  // Generate a simple preview thumbnail from content
  const getPreviewText = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim())
    return lines.slice(0, 3).join('\n').substring(0, 150) + (content.length > 150 ? '...' : '')
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground/80">Templates de Mensagem</h2>
            <p className="text-sm text-muted-foreground">Gerencie os modelos para seus convites e comunicados</p>
          </div>
          <Button 
            onClick={onCreateNew}
            className="bg-accent hover:bg-amber-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card className="border-dashed border-accent/20 bg-accent/5/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-accent/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum template criado</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Crie seu primeiro template para começar a enviar convites e comunicados personalizados.
              </p>
              <Button onClick={onCreateNew} className="bg-accent hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  layout
                >
                  <Card className="group overflow-hidden border-accent/10 hover:border-accent/30 hover:shadow-md transition-all h-full flex flex-col">
                    {/* Thumbnail Preview Area */}
                    <div 
                      className="h-24 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden cursor-pointer"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 left-4 w-16 h-1 bg-accent/60 rounded" />
                        <div className="absolute top-4 left-4 w-24 h-1 bg-amber-300 rounded" />
                        <div className="absolute top-6 left-4 w-20 h-1 bg-accent/15 rounded" />
                      </div>
                      
                      {/* Type Badge */}
                      <Badge 
                        variant="outline" 
                        className={`absolute top-2 right-2 ${getTypeColor(template.type)}`}
                      >
                        {getTypeIcon(template.type)}
                        <span className="ml-1 text-xs">{getTypeLabel(template.type)}</span>
                      </Badge>

                      {/* Preview overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 hover:bg-card"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(template)
                          }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Visualizar
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base text-foreground/80 line-clamp-1">
                          {template.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-muted-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEdit(template)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDuplicate(template)}
                              disabled={isDuplicating === template.id}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {isDuplicating === template.id ? 'Duplicando...' : 'Duplicar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                      {/* Subject (for email) */}
                      {template.type === 'email' && template.subject && (
                        <p className="text-sm font-medium text-muted-foreground mb-2 line-clamp-1">
                          {template.subject}
                        </p>
                      )}
                      
                      {/* Content Preview */}
                      <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted p-2 rounded">
                        {getPreviewText(template.content)}
                      </p>

                      {/* Variables */}
                      {parseVariables(template.variables).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {parseVariables(template.variables).slice(0, 4).map((v) => (
                            <Badge 
                              key={v} 
                              variant="secondary" 
                              className="text-[10px] bg-accent/10 text-accent"
                            >
                              {`{${v}}`}
                            </Badge>
                          ))}
                          {parseVariables(template.variables).length > 4 && (
                            <Badge 
                              variant="secondary" 
                              className="text-[10px] bg-muted text-muted-foreground"
                            >
                              +{parseVariables(template.variables).length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2 border-t border-amber-50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(template.updatedAt)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-accent hover:text-accent hover:bg-accent/5"
                          onClick={() => onEdit(template)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </>
  )
}
