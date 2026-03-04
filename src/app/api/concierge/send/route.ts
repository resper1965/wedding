export const dynamic = 'force-dynamic'
/**
 * Concierge Send Message API
 * Sends a test message via WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWhatsAppClient } from '@/services/whatsapp/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message } = body
    
    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        error: 'Telefone e mensagem são obrigatórios'
      }, { status: 400 })
    }
    
    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '')
    
    // Get WhatsApp client
    const client = getWhatsAppClient()
    
    if (!client) {
      // Simulate success for development
      console.log('[Concierge] Would send message to:', normalizedPhone)
      console.log('[Concierge] Message:', message)
      
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'WhatsApp não configurado - mensagem simulada'
      })
    }
    
    const result = await client.sendText(normalizedPhone, message)
    
    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error
    })
    
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao enviar mensagem'
    }, { status: 500 })
  }
}
