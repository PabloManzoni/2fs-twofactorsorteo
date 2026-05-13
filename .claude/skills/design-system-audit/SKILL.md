---
name: design-system-audit
description: Audita la fidelidad del código al sistema de diseño definido en `design.md`. Úsalo cuando el usuario diga "auditar diseño", "revisar sistema de diseño", "chequear que el código respete los tokens", "actualicé design.md y quiero ver qué quedó desalineado", "revisar fidelidad visual", "buscar valores hardcoded", "chequeo de tokens", o cualquier variante que implique comparar el código contra el design system. Especialmente relevante después de modificar `design.md` o `tokens.css`. Ofrece dos modos: (1) reporte de fidelidad, (2) reporte + aplicar correcciones.
---

# Design System Audit

Este skill compara el código fuente contra la fuente de verdad del sistema de diseño (`design.md` + `src/styles/tokens.css`) y reporta — o corrige — toda desviación: valores hardcoded, colores fuera de paleta, fonts no tokenizadas, spacings sueltos, etc.

## Cuándo correrlo

El caso típico: el usuario actualizó `design.md` (cambió un token, agregó una variante, ajustó la escala) y quiere verificar que el resto del código siga alineado. También sirve como check periódico para cazar drift visual.

## Flujo

Siempre se ejecuta en este orden:

1. **Cargar la fuente de verdad** (siempre).
2. **Escanear el código y producir el reporte** (siempre).
3. **Preguntar al usuario qué opción quiere**:
   - **A — Solo reporte.** Entregar el reporte y terminar.
   - **B — Reporte + aplicar correcciones.** Después del reporte, proponer ediciones concretas archivo por archivo y aplicarlas con confirmación.

Importante: **siempre** mostrar el reporte primero. La opción B no aplica nada sin que el usuario haya visto qué se va a cambiar.

## Paso 1 — Cargar la fuente de verdad

Leer en este orden:

1. `design.md` en la raíz del proyecto. Extraer:
   - Tokens de color (hex values + nombres de variable CSS).
   - Tokens de tipografía (`--font-display`, `--font-ui`, `--font-mono`).
   - Tokens de spacing (`--sp-*`), radii (`--r-*`), motion (`--ease`, `--dur-*`), border widths (`--bw-*`).
   - Aliases semánticos (`--bg`, `--surface`, `--accent`, etc.).
2. `src/styles/tokens.css` para confirmar qué tokens están **realmente definidos** en CSS (no solo documentados). Si hay tokens en `design.md` que no están en `tokens.css` o viceversa, eso es ya un hallazgo del reporte (categoría "token drift").

Guardar mentalmente las listas:
- **Hex permitidos**: todos los hex que aparecen en `tokens.css`.
- **Vars válidas**: todos los `--xxx` definidos.
- **Fonts permitidas**: las tres familias declaradas.

## Paso 2 — Escanear el código

Recorrer recursivamente `src/` (`.tsx`, `.ts`, `.css`). Para cada archivo, buscar:

### Violaciones de color
- Cualquier `#[0-9a-fA-F]{3,8}` que **no** esté en la lista de hex permitidos y **no** esté en `tokens.css` mismo. Ignorar hex dentro de comentarios obvios.
- `rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)` literales en código fuente (no en `tokens.css`).
- Color names CSS (`red`, `blue`, `black`, `white`...) usadas como valor de propiedad — excepto `transparent`, `currentColor`, `inherit`.

### Violaciones de tipografía
- `font-family:` con familia literal (`'Fraunces'`, `"Inter"`, etc.) en lugar de `var(--font-*)`. Excepción: `tokens.css` mismo.
- `font-weight` o `font-size` con valores literales que no correspondan a la escala documentada (12, 14, 16, 18, 22, 28, 36, 48, 64, 88, 120 px/rem) — flaggear como **revisión recomendada**, no como error duro (puede haber casos legítimos puntuales).

### Violaciones de spacing / sizing
- Valores en `px` o `rem` literales para `margin`, `padding`, `gap`, `top/right/bottom/left` que no coincidan con la escala 4/8/12/16/24/32/48/64/96/128. Excepción razonable: 1px, 2px (bordes y rules).
- Anchos fijos sueltos en lugar de `var(--col-*)`.

### Violaciones de radii / borders / motion
- `border-radius` literal que no coincida con la escala (0, 2, 4, 8, 12, 999).
- `border-width` literal fuera de {1, 1.5, 2}.
- `transition` / `animation` con `cubic-bezier(...)` literal en lugar de `var(--ease)`, o duraciones no documentadas.

### Estilos inline en JSX
- Atributo `style={{...}}` en componentes `.tsx`. Cada uno se reporta como caso a revisar (no siempre es un error, pero es una superficie típica de drift). Mostrar el valor exacto.

### Token drift
- Tokens documentados en `design.md` pero ausentes en `tokens.css`.
- Tokens definidos en `tokens.css` pero ausentes en `design.md`.

### Reglas de aesthetic del proyecto
Las restricciones declaradas en `design.md` también se verifican si aparecen explícitamente. Por ejemplo en 2FS: "no gradientes excepto el 8-ball", "no emoji en UI". Buscar:
- `linear-gradient`, `radial-gradient` fuera de los archivos del componente que la regla permita (en 2FS, fuera de `MagicBall/`).
- Caracteres emoji en strings de UI (i18n `.json`, JSX).

Si `design.md` declara otras reglas categóricas, sumarlas al escaneo.

### Cómo buscar eficientemente

Para cada categoría, usar `grep` (vía Bash) con regex específicas en lugar de leer cada archivo completo. Ejemplos:

```
grep -rnE "#[0-9a-fA-F]{3,8}\b" src/ --include="*.tsx" --include="*.ts" --include="*.css"
grep -rnE "rgba?\(" src/ --include="*.tsx" --include="*.css"
grep -rnE "font-family\s*:" src/ --include="*.css" --include="*.tsx"
grep -rnE "style=\{\{" src/ --include="*.tsx"
grep -rnE "(linear|radial)-gradient" src/
```

Luego filtrar a mano las coincidencias que sí son válidas (están en `tokens.css`, son `transparent`, etc.).

## Paso 3 — Producir el reporte

Formato fijo en markdown. Mostrarlo directo al usuario en el chat (no escribir un archivo a disco salvo que pida).

```
# Auditoría de sistema de diseño

**Proyecto:** <nombre>
**Fecha:** <YYYY-MM-DD>
**Archivos escaneados:** <N>
**Hallazgos totales:** <N>  ·  🔴 <críticos>  ·  🟡 <revisión>  ·  🔵 <info>

## Resumen

<una o dos frases en castellano sobre el estado general. Ej.: "El sistema está en buen estado: 3 hallazgos críticos concentrados en NamesPage.tsx, todos colores hardcoded que ya tienen token equivalente. Sin token drift.">

## Hallazgos críticos (🔴)
Cosas que violan el sistema y tienen un reemplazo claro.

### `src/pages/NamesPage.tsx:42`
- **Tipo:** color hardcoded
- **Valor encontrado:** `#C8442A`
- **Reemplazo sugerido:** `var(--accent-500)` (o el alias `var(--accent)`)
- **Contexto:** `color: '#C8442A'` dentro de `style={{...}}`

### ...

## Revisión recomendada (🟡)
Casos donde el valor podría ser legítimo pero conviene mirar.

### `src/components/Wheel/Wheel.tsx:118`
- **Tipo:** spacing fuera de escala
- **Valor encontrado:** `padding: 7px`
- **Nota:** la escala 4/8/12 no incluye 7. ¿Intención deliberada o typo de 8?

## Info (🔵)
Observaciones que no son violaciones pero conviene saber.

### Token drift
- `--accent-200` definido en `tokens.css` pero no documentado en `design.md`.

## Por archivo (resumen)

| Archivo | 🔴 | 🟡 | 🔵 |
| --- | --- | --- | --- |
| `src/pages/NamesPage.tsx` | 3 | 1 | 0 |
| ...
```

Reglas para el reporte:
- Si no hay hallazgos críticos, decirlo claramente arriba: "✅ Sin hallazgos críticos. El código está alineado al sistema de diseño." y luego mostrar 🟡 y 🔵 si los hay.
- Si hay >30 hallazgos críticos del mismo tipo (ej.: todo el proyecto usa `Inter` literal en lugar de `var(--font-ui)`), agruparlos en una sola entrada con conteo, no listar 30 veces lo mismo.
- Mantener los path como markdown links: `[NamesPage.tsx:42](src/pages/NamesPage.tsx:42)`.

## Paso 4 — Preguntar al usuario

Después del reporte, terminar con:

```
---
¿Cómo querés seguir?

**A.** Solo dejar el reporte y terminar.
**B.** Aplicar las correcciones de los hallazgos críticos (te muestro los cambios antes de confirmar).
```

Esperar respuesta. Si elige **A**, terminar. Si elige **B**, ir al paso 5.

## Paso 5 — Aplicar correcciones (solo si pide opción B)

Reglas para aplicar:

1. **Solo aplicar hallazgos críticos** (🔴). Los 🟡 son ambiguos y no se tocan automáticamente.
2. **Agrupar por archivo.** Para cada archivo afectado, mostrar un mini-diff de los cambios que se van a hacer:

   ```
   src/pages/NamesPage.tsx
     línea 42: '#C8442A' → 'var(--accent-500)'
     línea 87: '#141110' → 'var(--ink-900)'
   ```

3. **Pedir confirmación una sola vez al final** ("¿Aplico estos cambios?"), no archivo por archivo. Pablo prefiere avanzar.
4. **Aplicar las ediciones con Edit**, sin tocar más nada del archivo.
5. **Verificar después de aplicar:** correr `npm run build` (o `tsc -b && vite build` según el proyecto). Si rompe, mostrar el error y NO revertir automáticamente — explicar qué falló y dejar que el usuario decida.
6. **Reportar al final:** "Aplicados N cambios en M archivos. Build OK ✅" o el error si falló.

### Qué NO hacer en el paso 5

- No tocar `tokens.css` ni `design.md`. Esos son la fuente de verdad; este skill consume, no edita.
- No reescribir archivos enteros. Solo reemplazos puntuales.
- No "limpiar" código adyacente al hallazgo.
- No aplicar 🟡 ni 🔵 — esos quedan para que el humano decida.

## Notas de portabilidad

Este skill está pensado para proyectos que mantienen un `design.md` como fuente de verdad y un archivo de tokens CSS (típicamente `src/styles/tokens.css`). Si el proyecto tiene otros nombres:

- Buscar `design.md` o `DESIGN.md` en la raíz.
- Buscar el archivo de tokens en `src/styles/`, `app/styles/`, o donde el proyecto lo tenga; identificar por contenido (`:root { --... }`).
- Si no se encuentra ninguno, decirlo claramente y terminar — no inventar tokens.

El directorio escaneado por defecto es `src/`. Si el proyecto usa otro (`app/`, `lib/`, etc.), ajustar al detectarlo.

## Por qué este formato

El reporte está estructurado así para que sea útil tanto para Pablo (no programa, necesita entender el estado de un vistazo) como para una sesión técnica posterior. Los emojis de severidad (🔴🟡🔵) son la única excepción a "no emoji en UI" — acá son metadatos de auditoría, no copy de producto.

La opción A/B existe porque a veces el usuario solo quiere **saber** el estado (auditoría de salud) y otras veces quiere **arreglarlo** ya. Forzar siempre la corrección sería invasivo; forzar siempre solo el reporte sería trabajo extra. Que elija.
