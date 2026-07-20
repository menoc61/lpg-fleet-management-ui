import { create } from 'zustand'

const now = Date.now()

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export type AppNotification = {
  id: string
  title: string
  body: string
  ts: number
  level: NotificationLevel
  read: boolean
}

type NotificationsState = {
  items: AppNotification[]
  markRead: (id: string) => void
  markAllRead: () => void
  addNotification: (
    n: Omit<AppNotification, 'id' | 'read' | 'ts'> & { ts?: number }
  ) => void
}

const seed: AppNotification[] = [
  {
    id: 'n1',
    title: 'Nouvelle tournée planifiée',
    body: 'TRP-2404 ajoutée pour Tradex.',
    ts: now - 1000 * 60 * 5,
    level: 'info',
    read: false,
  },
  {
    id: 'n2',
    title: 'Alerte réserve Bonabéri',
    body: 'Niveau critique à 31% de capacité.',
    ts: now - 1000 * 60 * 42,
    level: 'warning',
    read: false,
  },
  {
    id: 'n3',
    title: 'Livraison terminée',
    body: 'TRP-2398 livrée (11 050 kg).',
    ts: now - 1000 * 60 * 90,
    level: 'success',
    read: true,
  },
  {
    id: 'n4',
    title: 'Anomalie détectée',
    body: 'Perte non comptabilisée sur TRP-2402.',
    ts: now - 1000 * 60 * 180,
    level: 'error',
    read: true,
  },
]

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: seed,
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
  addNotification: (n) =>
    set((s) => ({
      items: [
        {
          ...n,
          id: crypto.randomUUID(),
          ts: n.ts ?? Date.now(),
          read: false,
        },
        ...s.items,
      ],
    })),
}))

export const selectUnreadCount = (s: NotificationsState) =>
  s.items.filter((n) => !n.read).length
