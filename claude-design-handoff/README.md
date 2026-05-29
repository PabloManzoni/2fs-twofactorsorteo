# 2fs · Bundle para Claude Design

Snapshot del design system de **2fs · Two Factor Sorteo** listo para subir a un workspace de Claude Design. La idea: que CD herede el sistema ya curado, no que lo infiera del repo.

## Cómo subirlo

1. Abrí Claude Design (claude.ai → tab Design) y creá un workspace nuevo para **2fs**.
2. En el setup del design system, importá esta carpeta entera (drag & drop o ZIP).
3. Pegá el contenido de `design.md` en el campo de **brand voice / guidelines** — *especialmente la PARTE VIVA* (línea 121 en adelante). Sin eso, CD genera "funcional pero genérico".
4. Subí los 3 PNGs de `screens/` como referencias visuales del estado actual.

## Qué incluye y por qué

| Archivo | Por qué importa |
|---|---|
| `design.md` | Fuente única de verdad. Forma (tokens, componentes, screens) + alma (atmósfera, voz, anchors). **CD necesita las dos partes.** |
| `styles/tokens.css` | Tokens reales en CSS, espejo de `design.md`. Si hay drift entre los dos, este archivo es el que está en producción. |
| `styles/global.css` | Reset + body + keyframes + reduced-motion. Contexto base. |
| `styles/app.css` | Layouts de las páginas y utilidades. |
| `components/*.tsx` | Primitivos canónicos del sistema (`Button`, `Eyebrow`, `Avatar`, `Stamp`, `TicketPerforation`, `Wordmark`) + `VerdictCertificate` que es el componente compuesto más rico. CD los lee como "componentes base del sistema". |
| `screens/` | Capturas del estado actual de los 3 screens en desktop. CD las usa como ancla visual. |
| `drift-notes.md` | **Leelo antes de subir.** Listado de divergencias entre `design.md` y el código real. CD necesita saber cuál fuente confiar. |

## Filosofía del handoff

Claude Design ingiere repos automáticamente, pero infiere desde el código:
- Saca bien **colores, tipografía, espaciado** — son medibles.
- Infiere razonable los **componentes** — los lee del JSX.
- **Pierde la voz** — atmósfera, microcopy ritual, anti-anchors, el chiste Reina-Valera. Eso no se infiere de un `<button>`.

Por eso este bundle es **curado**, no automático: te garantiza que la próxima iteración en CD arranca con las 3 capas (tokens, componentes, voz) explícitas, no solo dos.

## Después de subirlo

Cuando hagas cambios en CD y vuelvas a Claude Code:
1. Exportá el bundle de handoff de CD.
2. Sobreescribí `design.md` con los cambios (revisá que la PARTE VIVA quede intacta — si CD la tocó, decidí vos qué entra).
3. Actualizá `src/styles/tokens.css` con los tokens nuevos.
4. Corré el skill `design-system-audit` para detectar valores hardcoded.
