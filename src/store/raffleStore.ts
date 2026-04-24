import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_PARTICIPANTS = 10;
export const MIN_PARTICIPANTS = 2;

export type Step = 1 | 2 | 3;

interface RaffleState {
  step: Step;
  /** Active pool. Shrinks when the 8-ball rejects a winner. */
  names: string[];
  /**
   * Snapshot of the names the user entered in step 1. Restored on resetAll so
   * that "Nuevo sorteo" keeps the last participants even if some were rejected.
   */
  baseNames: string[];
  winner: string | null;
  lastRejected: string | null;
  confirmed: string | null;
  goStep: (step: Step) => void;
  addName: (name: string) => { ok: boolean; error?: "duplicate" | "max" | "empty" };
  removeName: (name: string) => void;
  setWinner: (name: string | null) => void;
  rejectWinner: () => void;
  acceptWinner: () => void;
  clearConfirmed: () => void;
  resetAll: () => void;
}

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set, get) => ({
      step: 1,
      names: [],
      baseNames: [],
      winner: null,
      lastRejected: null,
      confirmed: null,

      goStep: (step) => set({ step }),

      addName: (raw) => {
        const name = raw.trim();
        if (!name) return { ok: false, error: "empty" };
        const { names, step } = get();
        if (names.length >= MAX_PARTICIPANTS) return { ok: false, error: "max" };
        if (names.some((n) => n.toLowerCase() === name.toLowerCase())) {
          return { ok: false, error: "duplicate" };
        }
        const nextNames = [...names, name];
        set({
          names: nextNames,
          // Only sync baseNames while the user is editing the urn at step 1.
          baseNames: step === 1 ? nextNames : get().baseNames,
        });
        return { ok: true };
      },

      removeName: (name) =>
        set((state) => {
          const nextNames = state.names.filter((n) => n !== name);
          return {
            names: nextNames,
            baseNames: state.step === 1 ? nextNames : state.baseNames,
          };
        }),

      setWinner: (winner) => set({ winner }),

      rejectWinner: () =>
        set((state) => {
          const rejected = state.winner;
          if (!rejected) return state;
          return {
            names: state.names.filter((n) => n !== rejected),
            winner: null,
            lastRejected: rejected,
            step: 2,
          };
        }),

      acceptWinner: () => set((state) => ({ confirmed: state.winner })),

      clearConfirmed: () => set({ confirmed: null }),

      /**
       * New raffle: keep the participants the user already entered (baseNames)
       * even if some were rejected during the last round. Start back at step 1.
       */
      resetAll: () =>
        set((state) => ({
          step: 1,
          names: state.baseNames.length > 0 ? [...state.baseNames] : state.names,
          winner: null,
          lastRejected: null,
          confirmed: null,
        })),
    }),
    {
      name: "2fs.raffle",
      partialize: (state) => ({
        names: state.names,
        baseNames: state.baseNames,
      }),
      // Back-fill baseNames for users persisted before this field existed.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.baseNames || state.baseNames.length === 0) {
          state.baseNames = [...state.names];
        }
      },
    },
  ),
);
