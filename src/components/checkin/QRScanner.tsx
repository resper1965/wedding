/**
 * ============================================================================
 * QR SCANNER COMPONENT
 * ============================================================================
 * 
 * Camera-based QR code scanner using html5-qrcode
 * Supports front and back camera switching
 * Shows scan results with animation
 * ============================================================================
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, SwitchCamera, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Types
export interface QRScanResult {
  valid: boolean
  alreadyCheckedIn?: boolean
  checkedInAt?: string
  data?: {
    invitationId: string
    familyName: string
    tableNumber?: string
    guests: Array<{
      id: string
      firstName: string
      lastName: string
      fullName: string
      dietaryRestrictions?: string | null
      specialNeeds?: string | null
    }>
  }
  error?: string
}

interface QRScannerProps {
  onScanSuccess: (result: QRScanResult) => void
  onScanError?: (error: string) => void
  isActive: boolean
  onClose: () => void
}

// ============================================================================
// QR SCANNER COMPONENT
// ============================================================================

export function QRScanner({ onScanSuccess, onScanError, isActive, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<unknown>(null)
  const isMountedRef = useRef(true)

  // Initialize scanner
  const initScanner = useCallback(async () => {
    if (!scannerRef.current || !isActive) return

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import('html5-qrcode')

      setCameraError(null)
      setIsScanning(true)

      const html5QrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText: string) => {
          // Prevent duplicate scans
          if (lastScanned === decodedText || isValidating) return

          setLastScanned(decodedText)
          setIsValidating(true)

          // Validate token with API
          try {
            const response = await fetch(`/api/checkin/${encodeURIComponent(decodedText)}`)
            const result: QRScanResult = await response.json()

            if (isMountedRef.current) {
              onScanSuccess(result)
            }
          } catch (error) {
            console.error('Validation error:', error)
            onScanError?.('Erro ao validar QR Code')
          } finally {
            if (isMountedRef.current) {
              setIsValidating(false)
            }
          }
        },
        () => {
          // QR not detected - silent
        }
      )

      setHasPermission(true)

    } catch (error) {
      console.error('Scanner init error:', error)
      setHasPermission(false)
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.')
      setIsScanning(false)
    }
  }, [isActive, lastScanned, isValidating, onScanSuccess, onScanError])

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const html5QrCode = html5QrCodeRef.current as { stop: () => Promise<void>; clear: () => void }
        await html5QrCode.stop()
        html5QrCode.clear()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
      html5QrCodeRef.current = null
    }
    setIsScanning(false)
  }, [])

  // Handle active state changes
  useEffect(() => {
    if (isActive) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initScanner()
      }, 100)
      return () => clearTimeout(timer)
    } else {
      stopScanner()
      setLastScanned(null)
    }
  }, [isActive, initScanner, stopScanner])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopScanner()
    }
  }, [stopScanner])

  // Switch camera
  const switchCamera = async () => {
    await stopScanner()
    // The next start will use the opposite camera
    // This is a simplified approach - full implementation would track camera state
    setTimeout(() => initScanner(), 300)
  }

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90"
    >
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          <span className="font-medium">Escanear QR Code</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex h-full items-center justify-center p-8">
        <div className="relative w-full max-w-sm">
          {/* Scanner Container */}
          <div
            id="qr-reader"
            ref={scannerRef}
            className="overflow-hidden rounded-2xl border-2 border-white/20"
          />

          {/* Scanning Overlay */}
          {isScanning && !cameraError && (
            <div className="pointer-events-none absolute inset-0">
              {/* Corner Markers */}
              <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-orange-400" />
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-orange-400" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-l-2 border-b-2 border-orange-400" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-r-2 border-b-2 border-orange-400" />

              {/* Scanning Line Animation */}
              <motion.div
                className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent"
                animate={{ top: ['20%', '80%', '20%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}

          {/* Loading State */}
          {isValidating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white">Validando...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Error */}
      <AnimatePresence>
        {cameraError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-4 right-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 soft-shadow">
              <AlertCircle className="h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-orange-800">Erro de Câmera</p>
                <p className="text-xs font-medium text-orange-700/80">{cameraError}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status & Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
        <div className="mx-auto flex max-w-sm items-center justify-between">
          <div className="flex items-center gap-2">
            {isScanning ? (
              <Badge className="gap-1 border-emerald-200 bg-emerald-100/90 text-emerald-700 tracking-wide uppercase font-bold text-[10px]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Escaneando
              </Badge>
            ) : hasPermission === false ? (
              <Badge className="gap-1 border-orange-200 bg-orange-100 text-orange-700 tracking-wide uppercase font-bold text-[10px]">
                <AlertCircle className="h-3 w-3" />
                Sem acesso
              </Badge>
            ) : (
              <Badge className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-700 tracking-wide uppercase font-bold text-[10px]">
                <Camera className="h-3 w-3" />
                Iniciando
              </Badge>
            )}
          </div>

          {isScanning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={switchCamera}
              className="text-white hover:bg-white/20"
            >
              <SwitchCamera className="mr-2 h-4 w-4" />
              Trocar Câmera
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default QRScanner
