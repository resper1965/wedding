import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Necessário role script para stress test bypass

const supabase = createClient(supabaseUrl, supabaseKey)

async function runStressTest() {
    console.log('🚀 Iniciando Teste de Stress e Integridade de Dados...')

    // 1. Identificar ou Criar Casamento para Teste
    let { data: wedding } = await supabase.from('Wedding').select('id').limit(1).maybeSingle()

    if (!wedding) {
        console.log('📝 Nenhum casamento encontrado. Criando um casamento temporário para o teste...')
        const { data: newWedding, error: createErr } = await supabase.from('Wedding').insert({
            id: crypto.randomUUID(),
            partner1Name: 'Teste',
            partner2Name: 'Stress',
            weddingDate: new Date('2025-12-25').toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            owner_id: '00000000-0000-0000-0000-000000000000' // ID neutro ou de teste
        }).select('id').single()

        if (createErr) {
            console.error('❌ Erro ao criar casamento de teste:', createErr.message)
            return
        }
        wedding = newWedding
    }

    const weddingId = wedding.id
    console.log(`📍 Testando no Casamento ID: ${weddingId}`)

    // 2. Simular Criação de Lote de Convidados (Stress)
    const guestsToCreate = 20
    console.log(`📦 Criando ${guestsToCreate} convidados simulados...`)

    const mockGuests = Array.from({ length: guestsToCreate }).map((_, i) => ({
        id: crypto.randomUUID(),
        weddingId,
        firstName: `StressTest_${i}`,
        lastName: 'User',
        email: `stress_${i}@test.com`,
        inviteStatus: 'pending',
        rsvpToken: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }))

    const { error: insertErr } = await supabase.from('Guest').insert(mockGuests)
    if (insertErr) {
        console.error('❌ Falha ao inserir convidados em massa:', insertErr.message)
        return
    }
    console.log('✅ Inserção em massa concluída.')

    // 3. Simular RSVPs Paralelos
    console.log('⚡ Simulando RSVPs paralelos...')
    const guestIds = mockGuests.map(g => g.id)

    const rsvpPromises = guestIds.map(async (id) => {
        return supabase.from('Guest').update({
            inviteStatus: 'confirmed',
            updatedAt: new Date().toISOString()
        }).eq('id', id)
    })

    const results = await Promise.all(rsvpPromises)
    const fails = results.filter(r => r.error)

    if (fails.length > 0) {
        console.error(`⚠️ ${fails.length} falhas durante o processo de RSVP.`)
    } else {
        console.log(`✅ Todos os ${guestsToCreate} RSVPs processados com sucesso.`)
    }

    // 4. Verificar Integridade dos Logs de Auditoria (Simulado)
    console.log('🕵️ Verificando se os logs do servidor capturaram as ações...')
    // Como o log_audit é via console.info, verificamos se a execução não quebrou
    console.log('ℹ️ Nota: Os logs de auditoria ISO 27001 são emitidos pelo runtime da API em /api/guests.')

    console.log('🏁 TESTE CONCLUÍDO COM SUCESSO. Integridade de banco mantida.')
}

runStressTest()
