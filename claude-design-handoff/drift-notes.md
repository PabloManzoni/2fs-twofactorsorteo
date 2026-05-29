# Drift entre `design.md` y el código real

Estado: **2026-05-29**. **Cambio reciente documentado a propósito:**
- `LanguageSwitcher` reescrito: ya no es un `<select>` nativo — ahora son **dos botones-bandera siempre visibles** (ES / EN) con SVG inline. Documentado en `design.md` y agregado a `components/LanguageSwitcher.tsx`. Estas son las divergencias detectadas entre lo que dice `design.md` y lo que el código realmente renderiza. Claude Design tiene que saber cuál fuente confiar antes de generar.

> **Regla general:** el código está más adelantado que `design.md`. La voz maduró hacia algo más litúrgico ("Libro I · El Rebaño" en vez de "01 · LA URNA"). `design.md` quedó en un estado anterior. Cuando hay conflicto, **confiá en los screenshots y en los archivos `.tsx`/`.css`** de este bundle, no en la prosa de `design.md`.

## Estructural

| Tema | `design.md` dice | Código tiene |
|---|---|---|
| Cierre del flujo | `ConfirmedModal` (modal con stamp) | **`VerdictCertificate.tsx`** — componente full-screen con `CornerDiamond`, `Flourish` con ornamento ❦, mucho más elaborado que un modal |
| Modos de step 3 | Solo "8 Ball" | **Dos modos**: `mode: "oracle"` (la bola) y `mode: "duel"` (piedra-papel-tijera entre los 2 finalistas). Ver `src/components/Duel/`. **No está documentado en `design.md`.** |
| Estado en el store | step + names + winner + lastRejected + confirmed | Más rico: `baseNames`, `outNames` (tachados, no removidos), `verdict`, `mode`, `certNumber` monotónico |

## Naming / voz (el cambio más grande)

| Elemento | `design.md` | Código real |
|---|---|---|
| Step 1 eyebrow | `01 · LA URNA` | `LIBRO I · EL REBAÑO` |
| Step 1 titular | `¿Quiénes entran al bombo?` | `Reuní al rebaño.` |
| Step 1 CTA | `Ir a la ruleta →` | `A la Rueda →` |
| Step 1 panel lateral | "regla de la casa" | `LEY DEL ORÁCULO` |
| Step 1 input | `+ Añadir` | `+ Sumar` (label: `SUMAR CORDERO`) |
| Step 2 titular | (no especificado) | `Que gire.` |
| Step 2 panel | `ESTADO` | `AUGURIO` |
| Step 2 stats | `PARTICIPANTES · SORTEO Nº · VELOCIDAD` | `REBAÑO · ORÁCULO Nº · IMPULSO` |
| Step 2 phase resting | `En reposo` | `En silencio` |
| Step 3 eyebrow | `03 · EL SEGUNDO FACTOR` | `LIBRO III · EL ORÁCULO` |
| Step 3 titular | (no especificado) | `La Bola ya lo sabe.` |
| Masthead edition | `EDICIÓN Nº 042` | `ORÁCULO Nº 042` |
| Stepper | `Participantes — Ruleta — 8 Ball` | `El Rebaño — La Rueda — El Oráculo` |

**Patrón:** el código abrazó el vocabulario sagrado del PARTE VIVA de `design.md` (Cordero, Rebaño, Oráculo, Libro). `design.md` form-section quedó con nombres "técnicos" anteriores. La PARTE VIVA sí está al día.

## Cosas que `design.md` describe pero el código no implementa (o cambió)

- **Stamp con `Nº 042`** — el código tiene `Stamp.tsx` pero `certNumber` ahora es monotónico desde 1, no hardcoded a 042.
- **8-ball outcomes** — `design.md` lista yes/no/**maybe**. El store solo tiene `Verdict = "yes" | "no"`. El `maybe` se eliminó.
- **`lastRejected` en el store** — `design.md` lo menciona; el código usa `outNames[]` (lista de tachados) en su lugar.

## Recomendación para Claude Design

1. **Tomá los tokens de `styles/tokens.css`** — son la verdad medible.
2. **Tomá los componentes de `components/*.tsx`** — son el set real.
3. **Tomá la PARTE VIVA de `design.md`** (líneas 121+) — sigue vigente, define la voz.
4. **Ignorá la sección "Screens" de `design.md` (líneas 84–112)** — está desactualizada. Confiá en los screenshots de `screens/` y en `VerdictCertificate.tsx`.
5. **Documentá el modo duel** si vas a regenerar — es contenido nuevo que el diseño desactualizado en CD no conoce.
