# 2FS — Design System

> Editorial newspaper aesthetic. **Paper cream + ink + single vermilion accent.** No gradients, no emoji.
>
> Primary display face: **Fraunces** (italic emphasis). UI face: **Inter**. Labels / numbers: **JetBrains Mono**.

## Tone

Treat every screen like the inside of a printed program. Eyebrow in small-caps mono (`01 · LA URNA`), large Fraunces headline with an italic twist word (`¿Quiénes _entran al bombo?_`), then a body setting in Fraunces italic at 22px. Borders are 1–1.5px in `--rule` or `--ink-900`. Stamps and ticket perforations carry the "sorteo oficial" metaphor.

## Tokens

### Color — paper mode (default, also used dark-revealed)

| Token | Value | Usage |
| --- | --- | --- |
| `--paper-50`  | `#FBF7EF` | Surface (cards, panels) |
| `--paper-100` | `#F4EFE6` | Page background |
| `--paper-200` | `#EDE6D8` | Hover surface |
| `--paper-300` | `#E0D7C4` | Subtle fills (off-lights) |
| `--paper-400` | `#C7BEA9` | Disabled tints |
| `--ink-900`   | `#141110` | Primary text, borders of emphasis |
| `--ink-700`   | `#3A3330` | Strong text |
| `--ink-500`   | `#6B6560` | Muted text |
| `--ink-300`   | `#A09890` | Placeholders |
| `--ink-100`   | `#D6CFC4` | Deep disabled |
| `--accent-500` | `#C8442A` | Vermilion — single accent |
| `--accent-600` | `#B33A23` | Hover/press |
| `--accent-300` | `#E89983` | Subtle tint |
| `--accent-100` | `#F6E3DB` | Background wash |
| `--gold-500`  | `#B8884A` | Ticket gold (sparingly) |
| `--success-500` | `#4A6B3E` | Moss green, never bright |

Semantic aliases: `--bg`, `--surface`, `--surface-hover`, `--fg`, `--fg-strong`, `--fg-muted`, `--fg-subtle`, `--fg-on-accent`, `--rule`, `--rule-strong`, `--accent`, `--accent-hover`, `--accent-wash`.

Dark-reveal mode (used only on the 8-ball reveal screen): switch `[data-theme="ink"]` — `--bg: #141110`, `--fg: var(--paper-100)`, etc.

### Type

| Token | Value |
| --- | --- |
| `--font-display` | Fraunces, serif |
| `--font-ui` | Inter, system-ui |
| `--font-mono` | JetBrains Mono, ui-monospace |

Scale: 12, 14, 16, 18, 22, 28, 36, 48, 64, 88, 120 (as rem in tokens).
Line heights: `--lh-tight: 1.05`, `--lh-snug: 1.2`, `--lh-normal: 1.5`, `--lh-relaxed: 1.65`.
Tracking: `--tr-tight: -0.02em`, `--tr-wide: 0.04em`, `--tr-eyebrow: 0.14em`.

### Spacing (4px base)

`--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 · `--sp-7` 48 · `--sp-8` 64 · `--sp-9` 96 · `--sp-10` 128.

### Radii / borders / motion

`--r-none: 0`, `--r-sm: 2`, `--r-md: 4`, `--r-lg: 8`, `--r-xl: 12`, `--r-pill: 999`.
Border widths: `--bw-1: 1`, `--bw-2: 1.5`, `--bw-3: 2`.
Motion: `--ease: cubic-bezier(0.2, 0, 0, 1)`, durations `--dur-fast 120`, `--dur-base 180`, `--dur-slow 320`, `--dur-reveal 1100`.

### Layout

`--col-read: 720px`, `--col-app: 1120px`, `--col-wide: 1360px`. All pages use `max-width: var(--col-app)` with horizontal padding `var(--sp-6)`.

## Components

**Masthead.** Newspaper-style header with Wordmark (`2fsº`), vertical rule, `SORTEO · DE · DOS · FACTORES` eyebrow, right side shows the localized long date and `EDICIÓN Nº 042`. Below a second row shows the stepper `01 Participantes — 02 Ruleta — 03 8 Ball` with the active step highlighted in accent.

**Button.** Three variants. `primary` = solid vermilion background with paper text. `secondary` = transparent with 1.5px ink border. `ghost` = underlined. Sizes `sm/md/lg` at `7/11/14 px vertical × 12/20/28 px horizontal`. Radius `--r-md`. Press state translates Y+1px.

**Input.** 1.5px ink border, paper surface background, ink text. Label is 13px Inter 500 in `--fg-muted` above. Optional hint at 12px `--fg-subtle` below.

**Eyebrow.** 11–12px JetBrains Mono 500, uppercase, tracking `--tr-eyebrow`, muted color.

**Avatar.** Circular 32px, initials (first + last) in `--paper-300` base or `--accent` when `highlight`.

**Stamp.** 100–140px SVG seal. Three concentric accent circles, circular `textPath` reading `SORTEO · OFICIAL · 2FS …`, central `Nº 042` in Fraunces italic + mono number.

**Wordmark.** `2fs` in Fraunces italic 700, with superscript `º` in accent.

**DoubleRule.** Two 1px rules separated by 3px gap. Used to close sections.

**Ticket perforation edge.** 28–32 small 4×4 dots spaced across the top of a panel; colored `var(--bg)` to appear as bite-outs of the paper card.

## Screens

### 01 · Participantes (La Urna)

Two columns @ 1120 wide. Left: input `+ Añadir` + regla de la casa panel. Right: numbered list in a bordered `--surface` card with ticket perforations at the top, avatars + 01/02 numbering in mono. Primary CTA `Ir a la ruleta →` bottom-right.

### 02 · Ruleta

Wheel with 32 lights in a ring (vermilion on, paper-300 off, pulsing while spinning). Sectors alternate vermilion `--accent-500` / ink `--ink-900`; if count is odd, last sector is `--gold-500`. Paper text on sectors. Inner hub: paper circle with `2fs` + `SORTEO` lockup, accent thin ring.

Drag circular; inertia; friction `0.985`; click per sector crossing (Web Audio square osc, pitch 500–900 Hz); ding on stop (880 + 1320 Hz sine pair).

Right side panel: `ESTADO` card with huge Fraunces of phase text (`En reposo` / `Girando…` / winner first-name). Below: stats in mono (`PARTICIPANTES`, `SORTEO Nº 042`, `VELOCIDAD`). Under panel: rejection notice (dashed) if a previous winner was rejected. Bottom: `Consultar la 8 Ball →` after done, else `← Editar participantes`.

### 03 · 8 Ball (El Segundo Factor)

380px ball: radial dark body, white "8" disc at top, dark blue window at bottom revealing an answer triangle. Mouse drag accumulates shake energy; over 30 triggers reveal. On reveal, the page `background` transitions to `#141110` and text flips to paper.

Outcomes:
- **yes** → tone color `--success-500`, header `LA CASA APRUEBA`, CTA `Confirmar a {Nombre} ✓` → opens ConfirmedModal.
- **no** → tone `--accent-500`, header `LA CASA RECHAZA`, CTA `Volver a la ruleta →` → pop rejected name from store, go back to /wheel.
- **maybe** → tone `--gold-500`, header `LA CASA DUDA`, CTA `Preguntar de nuevo` → reset ball.

A secondary `Sacudir otra vez` is always available in revealed state.

### Confirmed modal

Fullscreen scrim `rgba(20,17,16,0.72)`. Paper card with ticket perforation top, `VEREDICTO · OFICIAL` eyebrow, edition number, Stamp rotated +8°, `TENEMOS GANADOR`, huge Fraunces first name (88px, `opsz 120`), italic surname in `--fg-muted`, quote rule, CTA `Nuevo sorteo ↻`.

## Implementation rules (for coding agents)

- Map every token in this doc into `src/styles/tokens.css`. Consume in components via CSS custom properties only.
- All UI copy passes through `t()` (keys under `masthead.*`, `step1.*`, `step2.*`, `step3.*`, `confirmed.*`, `answers.*`).
- Audio is Web Audio API, synthesized at source — click, ding, rumble, reveal. No sample files required.
- Don't introduce new semantic colors. If you need emphasis, use `--accent` sparingly.
- Respect `prefers-reduced-motion`: no shake animation, instant reveal, no light pulse.
