import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_PARTICIPANTS = 10;
export const MIN_PARTICIPANTS = 2;

export type Step = 1 | 2 | 3;
export type Verdict = "yes" | "no";

/** Zero-padded 3-digit raffle id ("001", "042", "999", then just the number). */
export function formatCertNumber(n: number): string {
  return n < 1000 ? String(n).padStart(3, "0") : String(n);
}

interface RaffleState {
  step: Step;
  /** Full pool the user entered. Never shrinks except via step-1 edits. */
  names: string[];
  /** Snapshot of names at the last step-1 edit. resetAll restores from here. */
  baseNames: string[];
  /** Names that lost a round. Still in `names` but excluded from the wheel. */
  outNames: string[];
  winner: string | null;
  verdict: Verdict | null;
  /** Monotonic id shown on each certificate and in the masthead. Bumps
   *  whenever a certificate is dismissed, so no two certs share a number. */
  certNumber: number;

  goStep: (step: Step) => void;
  addName: (name: string) => { ok: boolean; error?: "duplicate" | "max" | "empty" };
  removeName: (name: string) => void;
  setWinner: (name: string | null) => void;
  /**
   * Seal the ball's verdict. A "no" pushes the current winner onto outNames
   * so they can't be drawn again this raffle.
   */
  acceptVerdict: (v: Verdict) => void;
  /** Dismiss a "no" certificate and go back to the wheel for another round. */
  continueRaffle: () => void;
  /** Full reset: restore base pool, clear outNames and verdict. */
  resetAll: () => void;
  /** Wipe the urn entirely — names, baseNames, outNames, and round state. */
  clearUrn: () => void;
}

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set, get) => ({
      step: 1,
      names: [],
      baseNames: [],
      outNames: [],
      winner: null,
      verdict: null,
      certNumber: 1,

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
          // Once someone is struck out, only the system can decide their fate.
          if (state.outNames.includes(name)) return state;
          const nextNames = state.names.filter((n) => n !== name);
          return {
            names: nextNames,
            baseNames: state.step === 1 ? nextNames : state.baseNames,
          };
        }),

      setWinner: (winner) => set({ winner }),

      acceptVerdict: (verdict) =>
        set((state) => {
          if (verdict === "no" && state.winner && !state.outNames.includes(state.winner)) {
            return { verdict, outNames: [...state.outNames, state.winner] };
          }
          return { verdict };
        }),

      continueRaffle: () =>
        set((state) => ({
          verdict: null,
          winner: null,
          step: 2,
          certNumber: state.certNumber + 1,
        })),

      resetAll: () =>
        set((state) => ({
          step: 1,
          names: state.baseNames.length > 0 ? [...state.baseNames] : state.names,
          outNames: [],
          winner: null,
          verdict: null,
          certNumber: state.certNumber + 1,
        })),

      clearUrn: () =>
        set((state) => ({
          step: 1,
          names: [],
          baseNames: [],
          outNames: [],
          winner: null,
          verdict: null,
          certNumber: state.certNumber + 1,
        })),
    }),
    {
      name: "2fs.raffle",
      partialize: (state) => ({
        names: state.names,
        baseNames: state.baseNames,
        outNames: state.outNames,
        certNumber: state.certNumber,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.baseNames || state.baseNames.length === 0) {
          state.baseNames = [...state.names];
        }
        if (!state.outNames) state.outNames = [];
        if (typeof state.certNumber !== "number" || state.certNumber < 1) {
          state.certNumber = 1;
        }
      },
    },
  ),
);
