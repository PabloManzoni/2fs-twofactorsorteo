/**
 * Web Audio synth. All tones are generated at source (no sample files).
 * Palette leans dark and mysterious: deep sub-bass rumble, slow drone
 * build-up, and a low chime strike on reveal.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
  const w = window as WebkitWindow;
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Short pitched tick — used per wheel sector. */
export function playClick(pitch = 800): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(pitch, t);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

/** Two-tone ding when the wheel stops. */
export function playDing(): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  for (const [i, f] of [880, 1320].entries()) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(gain).connect(c.destination);
    osc.start(t + i * 0.04);
    osc.stop(t + 1);
  }
}

/**
 * Dark sub-bass rumble. Emitted repeatedly while the ball is being shaken.
 * Two detuned sawtooths that slide down a few Hz, passed through a resonant
 * low-pass — feels like something stirring in a cave.
 */
export function playRumble(): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const o1 = c.createOscillator();
  o1.type = "sawtooth";
  o1.frequency.setValueAtTime(42, t);
  o1.frequency.linearRampToValueAtTime(34, t + 0.45);

  const o2 = c.createOscillator();
  o2.type = "sawtooth";
  o2.frequency.setValueAtTime(45, t);
  o2.frequency.linearRampToValueAtTime(36, t + 0.45);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(160, t);
  lp.Q.setValueAtTime(7, t);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

  o1.connect(lp);
  o2.connect(lp);
  lp.connect(gain).connect(c.destination);

  o1.start(t);
  o2.start(t);
  o1.stop(t + 0.6);
  o2.stop(t + 0.6);
}

type Tone = "yes" | "no" | "maybe";

/**
 * Slow, ominous reveal. A layered drone builds for ~1.2s, then a low resonant
 * chime strikes. Takes about 3s in total — designed to feel like waiting for
 * an oracle to speak.
 */
export function playReveal(tone: Tone): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;

  const base = tone === "yes" ? 130.81 : tone === "no" ? 116.54 : 123.47;
  const intervals =
    tone === "yes"
      ? [1, 1.5, 2]
      : tone === "no"
        ? [1, 1.414, 1.189]
        : [1, 1.06, 0.94];

  // Master gain — slow swell
  const master = c.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.22, t0 + 1.0);
  master.gain.exponentialRampToValueAtTime(0.001, t0 + 3.4);
  master.connect(c.destination);

  intervals.forEach((mult, i) => {
    const osc = c.createOscillator();
    osc.type = i === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(base * mult, t0);
    osc.detune.setValueAtTime((Math.random() - 0.5) * 6, t0);

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(320, t0);
    lp.frequency.linearRampToValueAtTime(1600, t0 + 1.5);

    const g = c.createGain();
    const start = t0 + i * 0.22;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.2, start + 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, start + 3.0);

    osc.connect(lp).connect(g).connect(master);
    osc.start(start);
    osc.stop(start + 3.1);
  });

  // Chime strike at ~1.3s
  const strikeT = t0 + 1.3;
  [base * 2, base * 3].forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, strikeT);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, strikeT);
    g.gain.exponentialRampToValueAtTime(i === 0 ? 0.22 : 0.1, strikeT + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, strikeT + 2.6);
    osc.connect(g).connect(c.destination);
    osc.start(strikeT);
    osc.stop(strikeT + 2.7);
  });
}

/** Warm up the context on first gesture — call inside a pointerdown. */
export function warmAudio(): void {
  getCtx();
}
