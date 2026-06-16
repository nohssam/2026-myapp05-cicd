import { create } from 'zustand'

const useGuestbookStore = create((set) => ({
    guestbooks: [],

    setGuestbooks: (list) => set({ guestbooks: list }),

    removeGuestbook: (g_idx) =>
        set((state) => ({
            guestbooks: state.guestbooks.filter((g) => g.g_idx !== g_idx)
        })),

    updateGuestbook: (g_idx, data) =>
        set((state) => ({
            guestbooks: state.guestbooks.map((g) =>
                g.g_idx === g_idx ? { ...g, ...data } : g
            )
        }))
}))

export default useGuestbookStore
