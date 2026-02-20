/**
 * Concierge Media API
 * Generates personalized invitation images
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalizedInvite } from '@/services/concierge/media-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { familyName, customMessage } = body
    
    if (!familyName) {
      return NextResponse.json({
        success: false,
        error: 'Nome da família é obrigatório'
      }, { status: 400 })
    }
    
    const result = await generatePersonalizedInvite({
      familyName,
      customMessage
    })
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      imagePath: result.imagePath,
      publicUrl: result.publicUrl
    })
    
  } catch (error) {
    console.error('Error generating media:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao gerar imagem'
    }, { status: 500 })
  }
}
