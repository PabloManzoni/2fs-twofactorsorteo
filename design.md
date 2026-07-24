# 2FS — Design System

> Editorial newspaper aesthetic. **Paper cream + ink + single vermilion accent.** No gradients, no emoji (flags in the language switcher are functional locale indicators, not decoration).
>
> Primary display face: **Fraunces** (italic emphasis). UI face: **Inter**. Labels / numbers: **JetBrains Mono**.

## Tone

Treat every screen like the inside of a printed program. Eyebrow in small-caps mono (`01 · LA URNA`), large Fraunces headline with an italic twist word (`¿Quiénes _entran al bombo?_`), then a body setting in Fraunces italic at 22px. Borders are 1–1.5px in `--rule` or `--ink-900`. Stamps and ticket perforations carry the "sorteo oficial" metaphor.

## Tokens

### Color — paper mode (default, also used dark-revealed)

| Token | Value | Usage |
| --- | --- | --- |
| `--paper-50`  | `#F4F1EC` | Surface (cards, panels) |
| `--paper-100` | `#EDE9E2` | Page background |
| `--paper-200` | `#E4DFD5` | Hover surface |
| `--paper-300` | `#D6CFC0` | Subtle fills (off-lights) |
| `--paper-400` | `#BDB6A5` | Disabled tints |
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

Dark-reveal mode (used only on the 8-ball reveal screen): switch `[data-theme="ink"]` — `--bg: #101113`, `--fg: var(--paper-100)`, etc.

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

**LanguageSwitcher.** Inline-flex group with `1.5px ink-900` border, `--r-md` radius, `--surface` background. **Both supported flags are always visible side-by-side** — never collapsed into a dropdown. Each flag is an inline 20×14 SVG (ES: red-yellow-red horizontal stripes; EN: simplified Union Jack on `#012169`) followed by the locale code in mono uppercase (`ES` / `EN`). Active flag inverts to `--ink-900` background with `--paper-50` text; inactive flags sit on `--surface` with `--fg-muted` text and hover to `--surface-hover`. A 1px `--rule` divider sits between flags. SVGs carry a 1px `--rule-strong` inset outline so the lighter flags don't disappear on green paper.

**Ticket perforation edge.** 28–32 small 4×4 dots spaced across the top of a panel; colored `var(--bg)` to appear as bite-outs of the paper card.

## Screens

### 01 · Participantes (La Urna)

Two columns @ 1120 wide. Left: input `+ Añadir` + regla de la casa panel. Right: numbered list in a bordered `--surface` card with ticket perforations at the top, avatars + 01/02 numbering in mono. Primary CTA `Ir a la ruleta →` bottom-right.

### 02 · Ruleta

Wheel with 32 lights in a ring (vermilion on, paper-300 off, pulsing while spinning). Sectors alternate vermilion `--accent-500` / ink `--ink-900`; if count is odd, last sector is `--gold-500`. Paper text on sectors. Inner hub: paper circle with `2fs` + `SORTEO` lockup, accent thin ring.

Drag circular; inertia; friction `0.985`; click per sector crossing (Web Audio square osc, pitch 500–900 Hz); ding on stop (880 + 1320 Hz sine pair).

Right side panel: `ESTADO` card with huge Fraunces of phase text (`En reposo` / `Girando…` / winner first-name). Below: stats in mono (`PARTICIPANTES`, `SORTEO Nº 042`, `VELOCIDAD`). Under panel: rejection notice (dashed) if a previous winner was rejected. Bottom: `Consultar la 8 Ball →` after done, else `← Editar participantes`.

### 03 · 8 Ball (El Segundo Factor)

380px ball: radial dark body, white "8" disc at top, dark blue window at bottom revealing an answer triangle. Mouse drag accumulates shake energy; over 30 triggers reveal. On reveal, the page `background` transitions to `#101113` and text flips to paper.

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

---

# PARTE VIVA — the soul

> Everything above this line is *form*. Everything below is *feeling*.
> The rigid part keeps the product on-brand; the living part keeps the product *itself*. When in doubt about a decision the tokens don't answer ("should this microcopy apologize?", "should this transition take longer?"), use this section as the tiebreaker.

## 12. What the product IS, emotionally

*atmosphere · emotions · spirit · personality · guiding metaphor*

**Atmosphere.** A parish newspaper office at the end of a long day. Type cases half-empty, ink drying on a stamp, a Magic 8-Ball on the editor's desk. Warm cream paper, ink-black titles, one stubborn vermilion mark on every page. Modern enough to run in a browser, analog enough that you can almost smell the ink.

**Emotions.** Anticipation tinged with conspiracy. Two coworkers pulling a small ritual to settle who gets the concert ticket. Not anxious (this isn't life-or-death), not whimsical (this is sacred while it happens). Something like **quiet ceremony** — a smile underneath the solemnity.

**Spirit.** Devout, but in on the joke. The product believes the ritual it performs *and* winks at it. Reverence as comedy device.

**Personality.** A 19th-century newspaper editor who moonlights as a deacon for a parish bingo. Speaks in Reina-Valera, prints in moveable type, has the only Magic 8-Ball blessed in three counties.

**Guiding metaphor — The Sacred Office Raffle.** A King James voice applied to "who's buying lunch." The form (edict, verse, stamp, anointing) is taken seriously; the silly content (a toy ball deciding the winner) is taken just as seriously. That mismatch is the joke and the brand at once.

## 13. What the product FEELS like

*physical sensations · density · light · rhythm*

**Physical sensations.** Paper, not glass. You can almost hear a stamp clack on the page. The wheel has weight; the ball has mass. Every interaction lands with a *thunk* before it ends. Modern at the edges (60fps, smooth dark-reveal transition) but analog at the core (perforations, stamps, ink bleeds in the radial gradients of the 8-ball).

**Density — deliberately dissonant.** This is *not* a harmonious design and that is the point. Display headlines are huge, almost grotesque (Fraunces 88px+, `opsz 120`); the labels beneath them are tiny mono whispers (11px JetBrains). The contrast is intentional — the product *yells* and *murmurs* on the same screen. Outside the wheel and the certificate, the screens are spacious: one column, generous margins, one element doing one thing.

**Light.** Soft and from above, the way light falls on paper on a desk. Cream picks it up, ink absorbs it. The dark-reveal mode (8-ball verdict) is candlelit — single warm vermilion glow against ink-black, like reading a verse by lantern.

**Rhythm.** Stillness → ceremony → stillness. The wheel screen rumbles (a viewport shake during the spin). The ball reveal takes ~3 seconds when it could take 0.3 — the wait *is* the ritual. Aphorisms function like a metronome — *"Así está escrito"*, *"In saecula saeculorum"*, *"Amén"* — they close each ritual moment like a wax seal.

## 14. How the product RELATES to the user

*posture · emotional states · tone toward outcomes*

**Posture — beside, not below.** The product never grovels (*"¡Hola! ¿Cómo te podemos ayudar hoy?"*) and never struts (*"Power your workflow."*). It **officiates**. It addresses the user with the formal *tú / thou* of liturgy, treating them as the celebrant in their own ritual.

**Emotional states by screen:**

- *Before the draw* — patient, hospitable. The tabernacle waits. The instruction is short. The page is warm.
- *During the spin* — theatrical, complicit. Lights pulse, viewport rumbles, mono telemetry updates (*FERVOR · 24.1°*). The product is **playing along** with the user's stakes.
- *On a YES verdict* — triumphant but contained. One word in display type (*EL UNGIDO* / *THE ANOINTED*), a stamped seal, a single coda line. No confetti.
- *On a NO verdict* — equally ceremonial. The product does **not** console — it casts out, with dignity. The loser's name is struck through, not hidden. Sacrifice has form.
- *On the last lamb standing* — it pronounces inevitability without irony. *"La Bola apartó a {{penultimate}}. Queda el último cordero."*

**Tone toward outcomes — there are no errors, only verdicts.** Wins are *anointings*, losses are *castings-out*, and both are issued with the same gravity and the same seal. The product never apologizes ("Oops!", "Something went wrong") and never celebrates ("Congrats!", "🎉"). It **records**.

## 15. How the product COMMUNICATES

*voice · silences · anchors and anti-anchors*

**Voice — compressed Reina-Valera / King James.** Short imperatives (*"Gira la Rueda."*), declaratives in third-person passive (*"La Bola lo ha apartado."*), aphorisms in pairs (*"Dos factores. Una voluntad."*), a Latin tag on every official seal (*in saecula saeculorum*, *in æternum*). Comedy lives in the **mismatch**: liturgy applied to silly stakes.

**Silences.** What the product *doesn't* say is half the voice:

- No *"Loading…"*, no *"Please wait"* — the product never apologizes for time. Waits are ceremonies, not delays.
- No emoji, ever. No exclamation marks. No *"Congratulations!"*
- No CTAs like *Get started · Continue · Submit*. Only **ritual verbs**: *Offer · Cast · Kneel · Accept · Purify*.
- No microcopy explaining what the buttons do. The form is its own instruction.
- No "we" voice — the brand never speaks as "we". Either it speaks *as the Ball* (1sg oracular) or *as the chronicler* (3sg passive).

**Anchors — words and gestures the product reaches for:**

> *Cordero · Tabernáculo · Sínodo · Bola · Rueda · Oráculo · Edicto · Versículo · Ungido · Apartado · Amén · In saecula saeculorum · In æternum · Así está escrito · La providencia · Habló en lenguas · El Libro · La Casa*

Plus the visual anchors: **ALL CAPS mono eyebrow · middle-dot `·` separator · italic `<em>` punchline on every headline · stamped circular seal · ticket perforation · ink-black borders 1.5px**.

**Anti-anchors — words and gestures the product never reaches for:**

> *Hola · Bienvenido · Continuar · Submit · Loading · Click here · Get started · Privacy · Terms · Hello! · Oops! · Welcome! · 🎉 · :) · "Tu cuenta" · "Tu perfil" · "Nuestra plataforma"*

Plus the visual anti-anchors: **gradients (except the 8-ball body) · drop shadows on UI · rounded buttons · emoji icons · "fun" illustrations · stock photography · pastel palettes · multi-color brand**.
