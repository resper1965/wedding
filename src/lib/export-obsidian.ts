import JSZip from 'jszip'
import { db } from '@/lib/db'

export async function generateObsidianVault(weddingId: string) {
    const zip = new JSZip()

    // 1. Fetch all data for the wedding
    const { data: wedding, error: weddingError } = await db.from('Wedding').select('*').eq('id', weddingId).single()
    if (weddingError || !wedding) throw new Error('Wedding not found')

    const { data: events } = await db.from('Event').select('*').eq('weddingId', weddingId).order('startTime')
    const { data: groups } = await db.from('GuestGroup').select('*').eq('weddingId', weddingId)
    const { data: guests } = await db.from('Guest').select('*, group:GuestGroup(name), rsvps:Rsvp(*, event:Event(name))').eq('weddingId', weddingId)

    // 2. Generate Root Index: O_Grande_Dia.md
    let indexMd = `---
title: "Casamento de ${wedding.partner1Name} e ${wedding.partner2Name}"
date: "${new Date(wedding.weddingDate).toISOString()}"
type: index
tags:
  - #wedding
---

# 💍 O Grande Dia: ${wedding.partner1Name} & ${wedding.partner2Name}

Local: ${wedding.venue || 'A confirmar'}
Data: ${new Date(wedding.weddingDate).toLocaleDateString('pt-BR')}

## Resumo
- Orçamento Base: ${wedding.budget || 'Não definido'}
- Eventos: ${events?.length || 0}
- Convidados: ${guests?.length || 0}
- Grupos Familiares: ${groups?.length || 0}

## Links Rápidos
- [[1_Eventos/Resumo_Eventos|Ver todos os Eventos]]
- [[2_Convidados/Resumo_Convidados|Ver todos os Convidados]]
- [[3_Grupos/Resumo_Grupos|Ver Estrutura de Grupos]]

---
*Documento gerado automaticamente pelo Marryflow AI Exporter.*
`
    zip.file('O_Grande_Dia.md', indexMd)

    // 3. Generate Events
    const eventsFolder = zip.folder('1_Eventos')
    if (events && eventsFolder) {
        let eventsIndex = '# 📅 Eventos\n\n'
        events.forEach((evt: any) => {
            const safeName = evt.name.replace(/[^a-zA-Z0-9_\u00C0-\u00FF]/g, '_')
            eventsIndex += `- [[${safeName}]]\n`

            const evtMd = `---
type: event
name: "${evt.name}"
startTime: "${evt.startTime}"
location: "${evt.venue || ''}"
tags:
  - #event
---

# ${evt.name}

**Data e Hora:** ${new Date(evt.startTime).toLocaleString('pt-BR')}  
**Local:** ${evt.venue || 'Sem local definido'}  
${evt.address ? `**Endereço:** ${evt.address}` : ''}  
**Dress Code:** ${evt.dressCode || 'Padrão'}  

## Descrição
${evt.description || 'Nenhuma descrição fornecida.'}

## Participantes Relacionados
*(Veja nas notas de convidados quem possui a tag confirmada para este evento)*
`
            eventsFolder.file(`${safeName}.md`, evtMd)
        })
        eventsFolder.file('Resumo_Eventos.md', eventsIndex)
    }

    // 4. Generate Groups
    const groupsFolder = zip.folder('3_Grupos')
    if (groups && groupsFolder) {
        let groupsIndex = '# 👨‍👩‍👧‍👦 Grupos Familiares\n\n'
        groups.forEach((grp: any) => {
            const safeName = grp.name.replace(/[^a-zA-Z0-9_\u00C0-\u00FF]/g, '_')
            groupsIndex += `- [[${safeName}]]\n`

            // Find guests in this group
            const groupGuests = guests?.filter((g: any) => g.groupId === grp.id) || []

            const grpMd = `---
type: group
name: "${grp.name}"
tags:
  - #group
---

# Grupo: ${grp.name}

${grp.description ? `> ${grp.description}` : ''}

## Convidados neste grupo:
${groupGuests.length > 0
                    ? groupGuests.map((g: any) => `- [[${g.firstName}_${g.lastName}]]`).join('\n')
                    : 'Nenhum convidado atribuído.'}
`
            groupsFolder.file(`${safeName}.md`, grpMd)
        })
        groupsFolder.file('Resumo_Grupos.md', groupsIndex)
    }

    // 5. Generate Guests (The biggest semantic advantage)
    const guestsFolder = zip.folder('2_Convidados')
    if (guests && guestsFolder) {
        let guestsIndex = '# 👥 Convidados\n\n'
        guests.forEach((g: any) => {
            const safeName = `${g.firstName}_${g.lastName}`.replace(/[^a-zA-Z0-9_\u00C0-\u00FF]/g, '_')
            guestsIndex += `- [[${safeName}]]\n`

            const groupLink = g.group ? `[[3_Grupos/${g.group.name.replace(/[^a-zA-Z0-9_\u00C0-\u00FF]/g, '_')}]]` : 'Nenhum'

            // Build RSVP semantic links
            const rsvpLinks = g.rsvps?.map((r: any) => {
                const evtName = r.event?.name ? r.event.name.replace(/[^a-zA-Z0-9_\u00C0-\u00FF]/g, '_') : 'Desconhecido'
                return `- Evento: [[1_Eventos/${evtName}]] | Status: **${r.status}** | Restrição: ${r.mealPreference || 'Nenhuma'}`
            }).join('\n') || 'Nenhum RSVP registrado.'

            const guestMd = `---
type: guest
firstName: "${g.firstName}"
lastName: "${g.lastName}"
email: "${g.email || ''}"
phone: "${g.phone || ''}"
category: "${g.category || ''}"
status: "${g.inviteStatus || ''}"
tags:
  - #guest
  - #${g.category?.toLowerCase() || 'geral'}
  - #${g.inviteStatus?.toLowerCase() || 'pendente'}
---

# ${g.firstName} ${g.lastName}

**Email:** ${g.email || 'Não informado'}  
**Telefone:** ${g.phone || 'Não informado'}  
**Categoria:** ${g.category || 'Geral'}  
**Relação:** ${g.relationship || 'Não informado'}  

## Localização no Grafo
- **Grupo Familiar:** ${groupLink}

## Status de Eventos (RSVP)
${rsvpLinks}

## Restrições e Notas
**Dieta Especial:** ${g.dietaryRestrictions || 'Nenhuma'}  
**Necessidades Especiais:** ${g.specialNeeds || 'Nenhuma'}  

> ${g.notes || '*Sem notas adicionais*'}
`
            guestsFolder.file(`${safeName}.md`, guestMd)
        })
        guestsFolder.file('Resumo_Convidados.md', guestsIndex)
    }

    // Generate buffer
    const content = await zip.generateAsync({ type: 'nodebuffer' })
    return content
}
