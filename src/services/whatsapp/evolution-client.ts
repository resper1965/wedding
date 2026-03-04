/**
 * ============================================================================
 * EVOLUTION API CLIENT
 * ============================================================================
 * 
 * Standardized client for Evolution API (v2)
 * Handles communication with WhatsApp Headless
 * ============================================================================
 */

export interface EvolutionConfig {
    apiUrl: string
    apiKey: string
    instanceName: string
}

export interface SendResult {
    success: boolean
    messageId?: string
    error?: string
}

export class EvolutionClient {
    private config: EvolutionConfig

    constructor(config: EvolutionConfig) {
        let apiUrl = config.apiUrl.trim().replace(/\/$/, '')
        if (!apiUrl.startsWith('http')) {
            apiUrl = `https://${apiUrl}`
        }
        this.config = {
            ...config,
            apiUrl
        }
    }

    /**
     * Send a text message
     */
    async sendText(to: string, text: string): Promise<SendResult> {
        try {
            const url = `${this.config.apiUrl}/message/sendText/${this.config.instanceName}`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: to,
                    text: text
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Evolution API Error (text):', error)
                return { success: false, error }
            }

            const data = await response.json()
            return { success: true, messageId: data.key?.id }
        } catch (err) {
            console.error('Evolution Client Error (text):', err)
            return { success: false, error: String(err) }
        }
    }

    /**
     * Send media (image, document, etc.)
     */
    async sendMedia(to: string, mediaUrl: string, mediaType: 'image' | 'video' | 'document' | 'audio', caption?: string): Promise<SendResult> {
        try {
            const url = `${this.config.apiUrl}/message/sendMedia/${this.config.instanceName}`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: to,
                    media: mediaUrl,
                    mediatype: mediaType,
                    caption: caption
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Evolution API Error (media):', error)
                return { success: false, error }
            }

            const data = await response.json()
            return { success: true, messageId: data.key?.id }
        } catch (err) {
            console.error('Evolution Client Error (media):', err)
            return { success: false, error: String(err) }
        }
    }

    /**
     * Send interactive buttons
     */
    async sendButtons(to: string, text: string, buttons: Array<{ title: string; id: string }>): Promise<SendResult> {
        try {
            const url = `${this.config.apiUrl}/message/sendButtons/${this.config.instanceName}`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: to,
                    title: text,
                    buttons: buttons.map(b => ({
                        buttonId: b.id,
                        buttonText: { displayText: b.title },
                        type: 1
                    }))
                })
            })

            if (!response.ok) {
                // Fallback to text if buttons fail (Evolution API versioning issues sometimes happen)
                console.warn('Buttons failed, falling back to text.')
                const fallbackText = `${text}\n\n${buttons.map(b => `[ ${b.title} ]`).join(' ')}`
                return this.sendText(to, fallbackText)
            }

            const data = await response.json()
            return { success: true, messageId: data.key?.id }
        } catch (err) {
            console.error('Evolution Client Error (buttons):', err)
            return { success: false, error: String(err) }
        }
    }
}

let instance: EvolutionClient | null = null

export function getEvolutionClient(): EvolutionClient | null {
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const instanceName = process.env.EVOLUTION_INSTANCE

    if (!apiUrl || !apiKey || !instanceName) {
        return null
    }

    if (!instance) {
        instance = new EvolutionClient({ apiUrl, apiKey, instanceName })
    }

    return instance
}
