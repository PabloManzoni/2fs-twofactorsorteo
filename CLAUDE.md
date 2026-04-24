# 2FS — Two Factor Sorteo

A "two-factor raffle" web app in three steps:

1. **Participants** — add between 2 and 10 names (max 10).
2. **Wheel** — drag-to-spin roulette with 32 ring lights and editorial hub. Web Audio ticks per sector.
3. **Magic 8-ball** — shake the ball by dragging; outcome is **yes / no / maybe**.
   - **yes** → `ConfirmedModal` with official stamp.
   - **no** → the rejected name is dropped from the pool and you're sent back to the wheel.
   - **maybe** → try again on the same ball.

## Stack

- Vite + React 19 + TypeScript
- `zustand` — single store with `step`, `names`, `winner`, `lastRejected`, `confirmed`.
- `react-i18next` + `i18next-browser-languagedetector` — ES default, EN secondary.
- `framer-motion` — animations where needed.
- **Web Audio API** (no sample files) — `src/lib/audio.ts` synthesizes clicks, ding, rumble, and reveal arpeggios.
- **No router.** Navigation is driven by `step` in the store; the three pages are rendered conditionally from `App.tsx`.

## Working rules for Claude Code

### Design system — **single source of truth is `./design.md`**

- Read `design.md` top to bottom before touching any visual code. All tokens (paper/ink ramps, vermilion accent, Fraunces / Inter / JetBrains Mono, spacing 4px base, radii, shadows, motion) live there and are mirrored into `src/styles/tokens.css`.
- **Never hardcode colors, spacing, fonts, radii, or motion values.** Consume `var(--token)` only.
- Use the shared primitives in `src/components/ui/` (`Button`, `Eyebrow`, `Avatar`, `Stamp`, `Wordmark`, `TicketPerforation`). Don't reinvent them.
- When adding new components or updating visual specs, run the `design:design-handoff` skill against `./design.md`, then `design:design-critique` on the affected screen.
- Aesthetic constraints: no gradients except the 8-ball body, no emoji in UI copy, single accent color (`--accent`), editorial tone.

### Language

- **Code in English.** Identifiers, file names, comments, i18n keys.
- **UI in Spanish by default.** Every user-facing string passes through `t()`. Add new keys to both `src/i18n/es.json` and `src/i18n/en.json`.
- HTML-bearing strings use `dangerouslySetInnerHTML` only for intentional editorial emphasis (e.g. `<em>…</em>` inside a heading).

### State

- Single zustand store in `src/store/raffleStore.ts`. Don't lift state into URL params or additional contexts. `step` drives which page renders.

### Audio

- All sounds are Web Audio oscillators in `src/lib/audio.ts`. Call `warmAudio()` inside the first `pointerdown` of any interaction that will play sound (browsers gate AudioContext on gesture).

### Dark reveal

- Step 3 flips the page background to ink when the ball reveals. It does this by setting `data-theme="ink"` on `document.body`. Remove the attribute on unmount.

## Scripts

```bash
npm run dev        # dev server
npm run build      # tsc + vite build
npm run preview
npm run lint
```

## File layout

```
src/
  App.tsx                  # shell: Masthead + conditional step page + ConfirmedModal
  main.tsx
  i18n/                    # es.json (default) + en.json + init
  store/raffleStore.ts
  lib/
    audio.ts               # Web Audio synth (click / ding / rumble / reveal)
    phrases.ts             # 8-ball questions + answer pool
  styles/
    tokens.css             # mirror of design.md
    global.css             # reset + body + keyframes + reduced-motion
    app.css                # page shells + layout utilities
  components/
    Masthead.tsx           # newspaper header + stepper + language switcher
    LanguageSwitcher.tsx
    ConfirmedModal.tsx
    Wheel/Wheel.tsx        # SVG wheel + 32 lights + drag physics
    MagicBall/MagicBall.tsx
    ui/                    # Button, Eyebrow, Avatar, Stamp, Wordmark, TicketPerforation
  pages/
    NamesPage.tsx          # Step 1 · La Urna
    WheelPage.tsx          # Step 2 · La Ruleta
    MagicBallPage.tsx      # Step 3 · El Segundo Factor
public/
  assets/                  # logo-mark.svg, stamp-sorteo.svg
```
