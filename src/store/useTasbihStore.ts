import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TasbihState {
  count: number;
  sessions: { id: string; count: number; date: number }[];
  increment: () => void;
  reset: () => void;
  saveSession: () => void;
  clearSessions: () => void;
}

export const useTasbihStore = create<TasbihState>()(
  persist(
    (set) => ({
      count: 0,
      sessions: [],
      increment: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
      saveSession: () => set((state) => {
        if (state.count === 0) return state;
        return {
          count: 0,
          sessions: [
            { id: crypto.randomUUID(), count: state.count, date: Date.now() },
            ...state.sessions
          ].slice(0, 20)
        };
      }),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'allexpert-tasbih',
    }
  )
);
