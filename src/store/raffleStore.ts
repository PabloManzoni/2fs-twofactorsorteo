import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_PARTICIPANTS = 10;
export const MIN_PARTICIPANTS = 2;

export type Step = 1 | 2 | 3;
export type Verdict = "yes" | "no";
/**
 * How step 3 resolves. Default "oracle" runs the Magic 8-ball; "duel" swaps
 * it for a rock-paper-scissors best-of-3 between the two remaining lambs.
 * Only meaningful when `step === 3`.
 */
export type Mode = "oracle" | "duel";

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
  /** Which resolver runs on step 3. Reset back to "oracle" on resetAll /
   *  continueRaffle so a previous duel path doesn't sticky into the next
   *  round. */
  mode: Mode;
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
  /** Enter the rock-paper-scissors path. Sets mode="duel" and goes to step 3.
   *  Caller is responsible for ensuring exactly two activeNames remain. */
  startDuel: () => void;
  /** Seal the duel result. Behaves like a "yes" verdict — the certificate
   *  shows the winner as the chosen one, identical to the oracle path. */
  finalizeDuel: (winnerName: string) => void;
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
      mode: "oracle",
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
          mode: "oracle",
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
          mode: "oracle",
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
          mode: "oracle",
          certNumber: state.certNumber + 1,
        })),

      // The duel takes the two remaining lambs and resolves with hand combat
      // instead of the oracle. We clear any leftover winner so the duel
      // chooses fresh — the wheel's pick doesn't carry over.
      startDuel: () => set({ mode: "duel", step: 3, winner: null }),

      // Settle the duel: treat the winner the same as an oracle "yes" so the
      // existing VerdictCertificate machinery shows the same anointed stamp.
      finalizeDuel: (winnerName) => set({ winner: winnerName, verdict: "yes" }),
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
