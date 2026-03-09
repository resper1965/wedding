'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronDown,
  ArrowLeft,
  Users,
  MessageSquare,
  Grid3X3,
  Gift,
  Hotel,
  Car,
  QrCode,
  Settings,
  BarChart3,
  Heart,
  Shield,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// HELP SECTION COMPONENT
// ============================================================================

interface HelpSectionProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function HelpSection({ icon: Icon, title, children, defaultOpen = false }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md transition-all hover:bg-card/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-6 py-5 text-left hover:bg-primary/5 transition-colors"
      >
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <span className="text-base font-bold text-foreground flex-1 font-serif">{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-stone-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-6 pb-6 text-sm text-muted-foreground/80 leading-relaxed space-y-3 border-t border-border/20"
        >
          <div className="pt-6">{children}</div>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// HELP PAGE
// ============================================================================

export default function AjudaPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground font-serif">Central de Ajuda</h1>
            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Manual de uso da plataforma</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* Primeiros Passos */}
        <HelpSection icon={Heart} title="Primeiros Passos" defaultOpen={true}>
          <p className="font-medium text-stone-700 mb-2">Bem-vindo à plataforma de gestão do casamento!</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse o <strong>Painel</strong> para ver o resumo geral: convidados confirmados, pendentes e declinados.</li>
            <li>Cadastre os <strong>Convidados</strong> individualmente ou em grupo (via convite/família).</li>
            <li>Configure os <strong>Eventos</strong> (cerimônia, recepção, etc.) nas Configurações.</li>
            <li>Envie convites e acompanhe respostas pelo <strong>Mensagens</strong>.</li>
            <li>No dia do evento, use o <strong>Check-in</strong> para controlar a entrada dos convidados.</li>
          </ol>
        </HelpSection>

        {/* Convidados */}
        <HelpSection icon={Users} title="Convidados">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-stone-700">Cadastrar convidado</p>
              <p>Vá em <strong>Convidados → Adicionar</strong>. Preencha nome, telefone, email e categoria (família, amigos, trabalho, etc.).</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Grupos e famílias</p>
              <p>Agrupe convidados por família ou convite. Isso facilita o envio de convites e controle de RSVPs.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Status do convite</p>
              <p>Cada convidado tem um status: <em>Pendente</em>, <em>Enviado</em>, <em>Confirmado</em>, <em>Declinado</em>. O status atualiza automaticamente quando o convidado responde via WhatsApp ou formulário.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Restrições alimentares</p>
              <p>O campo "Restrições Alimentares" aceita texto livre. Ex: vegetariano, alergia a frutos do mar, sem glúten.</p>
            </div>
          </div>
        </HelpSection>

        {/* Mensagens e WhatsApp */}
        <HelpSection icon={MessageSquare} title="Mensagens e WhatsApp">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-stone-700">Envio de convites</p>
              <p>Envie convites individuais ou em massa via WhatsApp. Configure templates em <strong>Configurações → Templates</strong>.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Concierge IA</p>
              <p>O bot de WhatsApp usa inteligência artificial para responder automaticamente aos convidados. Ele entende confirmações, pedidos de informação e restrições alimentares.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Agendar mensagens</p>
              <p>Use o <strong>Agendador</strong> para programar lembretes automáticos (ex: 30 dias antes, 7 dias antes, 2 dias antes).</p>
            </div>
          </div>
        </HelpSection>

        {/* Mesas */}
        <HelpSection icon={Grid3X3} title="Organização de Mesas">
          <div className="space-y-3">
            <p>O <strong>Planejador de Mesas</strong> permite organizar onde cada convidado vai sentar.</p>
            <div>
              <p className="font-medium text-stone-700">Criar mesa</p>
              <p>Clique em "Nova Mesa", defina nome, capacidade e formato (redonda, retangular, quadrada).</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Alocar convidados</p>
              <p>Arraste convidados confirmados para as mesas. O sistema mostra a capacidade restante de cada mesa.</p>
            </div>
          </div>
        </HelpSection>

        {/* Check-in */}
        <HelpSection icon={QrCode} title="Check-in no Evento">
          <div className="space-y-3">
            <p>O sistema de check-in funciona <strong>offline</strong> — ideal para locais sem internet estável.</p>
            <div>
              <p className="font-medium text-stone-700">Como usar</p>
              <p>Acesse <strong>/reception</strong> no celular ou tablet. Busque o convidado pelo nome e toque para confirmar entrada.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">QR Code</p>
              <p>Cada convite pode gerar um QR Code único. O recepcionista escaneia e o check-in é feito automaticamente.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Sincronização</p>
              <p>Check-ins offline são salvos no dispositivo e sincronizados automaticamente quando a internet voltar.</p>
            </div>
          </div>
        </HelpSection>

        {/* Presentes */}
        <HelpSection icon={Gift} title="Lista de Presentes">
          <div className="space-y-3">
            <p>Gerencie a lista de presentes em <strong>/presentes</strong>.</p>
            <div>
              <p className="font-medium text-stone-700">Adicionar presente</p>
              <p>Informe nome, descrição, preço, loja e link externo. Convidados podem reservar presentes pela página pública.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Status</p>
              <p>Presentes podem ter status <em>Disponível</em>, <em>Reservado</em> ou <em>Comprado</em>.</p>
            </div>
          </div>
        </HelpSection>

        {/* Hospedagem */}
        <HelpSection icon={Hotel} title="Hospedagem">
          <p>Cadastre hotéis e pousadas recomendados em <strong>Configurações</strong>. Inclua nome, endereço, faixa de preço, distância do local e código de desconto (se houver). Convidados veem essa lista na página <strong>/casamento/hospedagem</strong>.</p>
        </HelpSection>

        {/* Transporte */}
        <HelpSection icon={Car} title="Transporte">
          <p>Configure opções de transporte (ônibus fretado, Uber, estacionamento). Cada opção pode ter descrição, preço estimado e link para reserva. Visível para convidados em <strong>/casamento/info</strong>.</p>
        </HelpSection>

        {/* Analytics */}
        <HelpSection icon={BarChart3} title="Analytics">
          <div className="space-y-3">
            <p>O painel de <strong>Analytics</strong> mostra dados em tempo real:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Taxa de confirmação por evento</li>
              <li>Convidados por categoria (família, amigos, trabalho)</li>
              <li>Restrições alimentares consolidadas</li>
              <li>Histórico de respostas ao longo do tempo</li>
              <li>Status dos convites enviados</li>
            </ul>
          </div>
        </HelpSection>

        {/* Configurações */}
        <HelpSection icon={Settings} title="Configurações">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-stone-700">Dados do Casamento</p>
              <p>Edite nomes, data, local e endereço.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Eventos</p>
              <p>Cadastre múltiplos eventos (cerimônia, recepção, festa). Cada evento pode ter local, horário e dress code diferentes.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">WhatsApp</p>
              <p>Configure o token, phone ID e webhook do WhatsApp Business API.</p>
            </div>
            <div>
              <p className="font-medium text-stone-700">Lembretes automáticos</p>
              <p>Defina quantos dias antes do evento enviar lembretes (padrão: 30, 7 e 2 dias).</p>
            </div>
          </div>
        </HelpSection>

        {/* Segurança */}
        <HelpSection icon={Shield} title="Segurança e Acesso">
          <div className="space-y-3">
            <p>O acesso ao painel é protegido por <strong>email e senha</strong>.</p>
            <p>As rotas de API administrativas requerem autenticação JWT. As rotas públicas (RSVP, informações do casamento, presentes) são acessíveis sem login.</p>
            <p>Dados sensíveis (tokens WhatsApp, chaves API) ficam armazenados com segurança nas variáveis de ambiente do servidor.</p>
          </div>
        </HelpSection>

        {/* App Mobile */}
        <HelpSection icon={Smartphone} title="Uso no Celular">
          <p>A plataforma é <strong>100% responsiva</strong> — funciona no celular e tablet. Para o check-in no dia do evento, recomendamos salvar o site como atalho na tela inicial do celular para acesso rápido (funciona como um app).</p>
        </HelpSection>

        {/* Footer */}
        <div className="pt-12 text-center text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">
          <p>Marryflow • Plataforma de Gestão Premium</p>
        </div>
      </div>
    </div>
  )
}
