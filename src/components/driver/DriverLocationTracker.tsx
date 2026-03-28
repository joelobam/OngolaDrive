'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation, WifiOff } from 'lucide-react'

interface Props {
  deliveryId: string
}

export default function DriverLocationTracker({ deliveryId }: Props) {
  const [status, setStatus] = useState<'idle' | 'tracking' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const supabase = createClient()

  const updateLocation = async (lat: number, lng: number) => {
    // Supabase stocke la géographie en WKT : 'POINT(lng lat)'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('deliveries') as any)
      .update({ location: `POINT(${lng} ${lat})` })
      .eq('id', deliveryId)
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée sur cet appareil.')
      setStatus('error')
      return
    }

    setStatus('tracking')
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        updateLocation(pos.coords.latitude, pos.coords.longitude)
      },
      err => {
        setError('Impossible d\'accéder à la position GPS.')
        setStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setStatus('idle')
  }

  // Démarrage automatique
  useEffect(() => {
    startTracking()
    return () => stopTracking()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId])

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3 text-sm text-red-600">
        <WifiOff size={15} />
        <span>{error ?? 'Erreur GPS'}</span>
        <button onClick={startTracking} className="ml-auto text-xs underline">Réessayer</button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-3 text-sm font-medium ${
      status === 'tracking' ? 'bg-primary-50 border border-primary-light text-primary-dark' : 'bg-gray-50 border border-gray-100 text-gray-500'
    }`}>
      <Navigation size={15} className={status === 'tracking' ? 'text-primary animate-pulse' : 'text-gray-400'} />
      {status === 'tracking' ? 'Position GPS transmise en temps réel' : 'GPS inactif'}
    </div>
  )
}
