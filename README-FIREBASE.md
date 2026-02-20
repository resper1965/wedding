# 💍 Wedding Concierge - Firebase Edition

Uma plataforma elegante para gestão de convidados de casamento com **experiência invisível** via WhatsApp, agora 100% no Firebase.

![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)

---

## 🏗️ Arquitetura Serverless Event-Driven

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  WhatsApp API   │────▶│  Cloud Function  │────▶│   Firestore     │
│    (Webhook)    │     │  (Receiver)      │     │ messages_queue  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌─────────────────────────────────┘
                        │ Trigger: onCreate
                        ▼
               ┌──────────────────┐
               │  Cloud Function  │
               │  (Brain - AI)    │
               └────────┬─────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ OpenAI   │  │Firestore │  │WhatsApp  │
    │ GPT-4o   │  │  Update  │  │  Reply   │
    └──────────┘  └──────────┘  └──────────┘
```

### Por que Event-Driven?

A WhatsApp API tem timeouts estritos. Não podemos processar IA na mesma requisição do webhook. O padrão Firestore Trigger resolve isso:

1. **Webhook** → Grava mensagem → **Retorna 200 OK** (instantâneo)
2. **Trigger onCreate** → Processa IA → Envia resposta
3. **Idempotência** garantida pelo Firestore

---

## 📦 Estrutura do Projeto

```
wedding/
├── firebase/
│   ├── functions/              # Cloud Functions
│   │   ├── src/
│   │   │   ├── index.ts        # Webhook receiver + triggers
│   │   │   ├── schema.ts       # TypeScript types
│   │   │   ├── ai-processor.ts # OpenAI integration
│   │   │   └── image-generator.ts # Sharp image generation
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── firestore.rules         # Security rules
│   ├── firestore.indexes.json  # Query indexes
│   ├── storage.rules           # Storage security
│   └── firebase.json           # Firebase config
│
├── src/
│   ├── app/
│   │   ├── reception/          # Offline-first check-in app
│   │   ├── dashboard/          # Staff dashboard
│   │   └── ...
│   ├── hooks/
│   │   └── use-offline-checkin.ts  # Offline-first hook
│   └── lib/
│       └── firebase.ts         # Firebase SDK config
│
└── storage/
    └── templates/              # Invite templates
```

---

## 🗄️ Schema NoSQL (Firestore)

### Collection: `invitations` (Agregador Familiar)

```typescript
{
  id: string
  weddingId: string
  primaryPhone: string      // WhatsApp do responsável
  primaryName: string
  maxGuests: number         // Limite de convidados
  confirmedCount: number
  status: 'pending' | 'partial' | 'confirmed' | 'declined'
  inviteToken: string       // URL-safe token
  
  // Sub-collections:
  // - guests
  // - conversation_history
}
```

### Sub-collection: `guests`

```typescript
{
  id: string
  firstName: string
  lastName: string
  fullName: string          // Denormalizado para busca
  overallStatus: 'pending' | 'confirmed' | 'declined'
  rsvpStatus: {
    [eventId]: {
      status: string
      respondedAt: Timestamp
    }
  }
  dietaryRestrictions?: string
}
```

### Collection: `messages_queue`

```typescript
{
  id: string
  fromPhone: string
  messageType: 'text' | 'image' | 'audio'
  content: { text?: string, mediaId?: string }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processingAttempts: number
  receivedAt: Timestamp
  processedAt?: Timestamp
}
```

---

## 🤖 AI Concierge (The Brain)

### System Prompt

```
Você é o Concierge do Casamento de [Noivo] & [Noiva].

Personalidade: Elegante, acolhedor e prestativo.

Responsabilidades:
1. Confirmar presença
2. Registrar restrições alimentares
3. Fornecer informações do evento
4. Gerar convites personalizados

Use FUNCTIONS para executar ações.
```

### Functions Disponíveis

| Function | Descrição |
|----------|-----------|
| `confirm_guest` | Confirma presença |
| `decline_guest` | Registra desistência |
| `add_dietary_restriction` | Anota restrição |
| `request_invite_image` | Gera convite personalizado |
| `get_event_info` | Info do evento |
| `get_directions` | Como chegar |

---

## 🎨 Geração de Imagens (The Artist)

```
Template Base (Storage)
        │
        ▼
    ┌───────┐
    │ Sharp │ ← Compõe nome, data, local
    └───────┘
        │
        ▼
Imagem Personalizada → Storage → Signed URL → WhatsApp
```

### Características:
- Template base baixado do Storage
- Sharp para composição de texto
- Signed URLs com 30 dias de validade
- Cache no Firestore

---

## 📱 App de Recepção (Offline-First)

### Funcionalidades:
- ✅ Check-in mesmo **sem internet**
- ✅ Cache nativo do Firestore
- ✅ Sincronização automática
- ✅ Busca por nome

### Como funciona:

```typescript
// Firestore SDK com cache persistente
firestore.settings({
  cache: 'persistent',
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

// Dados carregam do cache se offline
onSnapshot(query, (snapshot) => {
  // Firestore usa cache automaticamente
})

// Check-in salvo localmente
await addDoc('check_in', {
  ...data,
  syncedAt: isOnline ? serverTimestamp() : null
})
```

---

## 🚀 Deploy

### 1. Configurar Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init
```

### 2. Configurar Secrets

```bash
firebase functions:secrets:set WHATSAPP_TOKEN
firebase functions:secrets:set WHATSAPP_PHONE_ID
firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN
firebase functions:secrets:set OPENAI_API_KEY
```

### 3. Deploy

```bash
# Deploy Functions
firebase deploy --only functions

# Deploy Firestore Rules
firebase deploy --only firestore

# Deploy Storage Rules
firebase deploy --only storage

# Deploy tudo
firebase deploy
```

### 4. Configurar Webhook WhatsApp

```
URL: https://southamerica-east1-PROJECT-ID.cloudfunctions.net/webhookReceive
Verify Token: [seu token]
```

---

## 📊 Monitoramento

### Cloud Functions Logs

```bash
firebase functions:log
```

### Métricas no Console

- Mensagens processadas
- Tempo de resposta IA
- Check-ins offline pendentes

---

## 🔒 Segurança

### Firestore Rules

```javascript
// Staff pode gerenciar
match /invitations/{id} {
  allow read: if isStaff() || request.auth.token.invitationId == id;
  allow write: if isStaff();
}

// Guests podem ler próprio convite
match /guests/{id} {
  allow read: if isStaff() || isOwnInvitation();
}
```

---

## 🎯 Próximos Passos

- [ ] Implementar envio real WhatsApp Business API
- [ ] Adicionar templates de convite customizáveis
- [ ] Dashboard de analytics em tempo real
- [ ] Notificações push para novos RSVPs

---

**Louise & Nicolas** 💒  
15 de Março de 2025

*Feito com ❤️ usando Firebase*
