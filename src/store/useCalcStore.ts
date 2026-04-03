import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface CalcState {
  history: CalcHistoryItem[];
  addHistory: (expression: string, result: string) => void;
  clearHistory: () => void;
}

export const useCalcStore = create<CalcState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (expression, result) => set((state) => ({
        history: [
          {
            id: crypto.randomUUID(),
            expression,
            result,
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 50) // Keep last 50
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'allexpert-calc',
    }
  )
);
