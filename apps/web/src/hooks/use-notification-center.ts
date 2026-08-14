import { useCallback, useEffect, useState } from 'react'
import { playNotificationSound, shouldPlaySound } from './use-notification-sound'

/**
 * Drives the notification bell off WebSocket events (`ws:notify`), so an
 * `anomaly:new`/`tour:update` pushed by the server (or emitted by the mock
 * WS service) increments the unread badge and plays a short sound.
 * Opening the center clears the WS-driven counter.
 */
export function useNotificationCenter(enabled = true) {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const handler = () => {
      setUnread((n) => n + 1)
      if (shouldPlaySound(true)) playNotificationSound()
    }
    window.addEventListener('ws:notify', handler)
    return () => window.removeEventListener('ws:notify', handler)
  }, [enabled])

  const openCenter = useCallback(() => {
    setUnread(0)
    setOpen(true)
  }, [])

  return { unread, open, openCenter, setOpen }
}
