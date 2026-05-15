/**
 * Pure logic for the duel — kept in its own module so the hand icons can
 * stay component-only and play nicely with React Fast Refresh.
 */
import type { Hand } from "./hands";

export const ALL_HANDS: Hand[] = ["rock", "paper", "scissors"];

/**
 * Round resolution. Returns "left", "right", or "tie".
 * Rock crushes scissors, scissors cut paper, paper covers rock.
 */
export function resolveRound(left: Hand, right: Hand): "left" | "right" | "tie" {
  if (left === right) return "tie";
  if (
    (left === "rock" && right === "scissors") ||
    (left === "scissors" && right === "paper") ||
    (left === "paper" && right === "rock")
  ) {
    return "left";
  }
  return "right";
}
