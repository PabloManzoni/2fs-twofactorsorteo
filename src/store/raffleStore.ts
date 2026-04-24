import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_PARTICIPANTS = 10;
export const MIN_PARTICIPANTS = 2;

export type Step = 1 | 2 | 3;
export type Verdict = "yes" | "no";

interface RaffleState {
  step: Step;
  /** Active pool. The same as baseNames outside step 1 edits. */
  names: string[];
  /**
   * Snapshot of the names the user entered in step 1. Restored on resetAll so
   * that "Volver a empezar" keeps the last participants.
   */
  baseNames: string[];
  winner: string | null;
  /**
   * Final verdict spoken by the 8-ball once the user accepts the fate.
   * While non-null, the certificate is shown over the app.
   */
  verdict: Verdict | null;

  goStep: (step: Step) => void;
  addName: (name: string) => { ok: boolean; error?: "duplicate" | "max" | "empty" };
  removeName: (name: string) => void;
  setWinner: (name: string | null) => void;
  acceptVerdict: (v: Verdict) => void;
  resetAll: () => void;
}

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set, get) => ({
      step: 1,
      names: [],
      baseNames: [],
      winner: null,
      verdict: null,

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

      acceptVerdict: (verdict) => set({ verdict }),

      /**
       * Volver a empezar. Restores names from the last step-1 snapshot and
       * clears all raffle state, sending the user back to the urn.
       */
      resetAll: () =>
        set((state) => ({
          step: 1,
          names: state.baseNames.length > 0 ? [...state.baseNames] : state.names,
          winner: null,
          verdict: null,
        })),
    }),
    {
      name: "2fs.raffle",
      partialize: (state) => ({
        names: state.names,
        baseNames: state.baseNames,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.baseNames || state.baseNames.length === 0) {
          state.baseNames = [...state.names];
        }
      },
    },
  ),
);
