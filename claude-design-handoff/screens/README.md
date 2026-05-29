# Screenshots de los 3 screens

## Qué hace falta acá

Tres PNGs en estado real, en desktop (1280×820 o más ancho):

- `01-rebano.png` — Step 1 con 5 nombres ya cargados (Agustín, Mateo, Lucía, Sofía, Tomás).
- `02-rueda.png` — Step 2, rueda en reposo, 5 sectores.
- `03-oraculo.png` — Step 3, la bola con `Lucía` como cordero provisional, antes de sacudir.

## Cómo capturarlos (paso a mano)

El dev server ya quedó corriendo en `http://localhost:5173` con datos seedeados:

```
nombres: Agustín, Mateo, Lucía, Sofía, Tomás
certNumber: 42
```

1. Abrí Chrome en `http://localhost:5173`.
2. Para cada step:
   - Step 1: abrí DevTools → Application → Local Storage → `2fs.raffle` → asegurate de que `state.step` sea `1`. Recargá.
   - Step 2: cambiá `state.step` a `2`, recargá.
   - Step 3: cambiá `state.step` a `3` y `state.winner` a `"Lucía"`, recargá.
3. En cada uno, **Cmd+Shift+4** → **Espacio** → click sobre la ventana del browser → guardá en esta carpeta con el nombre correspondiente.

> Alternativa rápida: pedile a Claude Code "tomá los 3 screenshots desde el preview y guardalos en `claude-design-handoff/screens/`" — el dev server ya está listo, lo único que falta es la escritura a disco.

## Por qué importan

Claude Design los usa como **ancla visual** del estado actual. Sin esto, CD genera basándose solo en tokens + componentes y puede inventar layouts que no respetan las decisiones de composición (la rueda de 32 luces y su panel `AUGURIO`, la verticalidad del step 3, etc.).
