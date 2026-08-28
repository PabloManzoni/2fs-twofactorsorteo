/**
 * Pacing for the hands-off run. Every page reads its beat from here so the
 * whole thing keeps one rhythm — long enough to watch, short enough that a
 * raffle with several rejections doesn't outlast the room's patience.
 */

/** Wheel: pause on the landed name before moving to the ball. */
export const AUTO_WHEEL_HOLD_MS = 1400;
/** Wheel: beat before the first automatic spin, so the screen registers. */
export const AUTO_WHEEL_START_MS = 600;
/** Ball: beat before the automatic shake starts. */
export const AUTO_BALL_START_MS = 900;
/** Ball: pause on the revealed answer before sealing the verdict. */
export const AUTO_BALL_HOLD_MS = 2000;
/** Certificate: pause on a rejection before spinning again. */
export const AUTO_REJECT_HOLD_MS = 2600;
/** Duel: beat between automatic throws. */
export const AUTO_DUEL_THROW_MS = 900;
