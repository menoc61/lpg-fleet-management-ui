import { create } from 'zustand'

type GlobalSearchStore = {
  open: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useGlobalSearchStore = create<GlobalSearchStore>()((set) => ({
  open: false,
  open: () => set({ open: true }),
  close: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}))