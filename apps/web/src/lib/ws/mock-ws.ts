export function emitWs(event: string, payload?: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('ws:event', { detail: { event, payload } }))
}
