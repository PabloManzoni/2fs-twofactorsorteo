# Autopilot report — 2fs (Two Factor Sorteo)

> Multi-user synthetic simulation — **user-simulation autopilot**.
> **App:** 2FS — Two Factor Sorteo (single-page app, local) · **Date:** 2026-07-02 · **Runs:** 2

**Business:** App lúdica de "sorteo de dos factores" que elige a una persona de un grupo de 2–10 en tres pasos editoriales con tema de oráculo/rebaño: se cargan nombres, una rueda elige uno y una bola mágica lo confirma (sí) o lo descarta y lo elimina del pool (no).

## Runs

| User | Role | Pole | Task | Result | Steps | ~Time |
|------|------|------|------|--------|-------|-------|
| 2fs-organizer | Organizador práctico, orientado al resultado (End user) | — | T1 — Cargar personas y llegar a un ganador confirmado (camino feliz; oráculo dio SÍ) | Goal reached | 7 | 90 s |
| 2fs-organizer | Organizador práctico, orientado al resultado (End user) | — | T2 — Correr un sorteo hasta un ganador; esta corrida cayó dos veces en la rama de rechazo ("no") | Abandoned (step 10) | 10 | 134 s |

## Findings by convergence

### Hit every user (structural)

1. **La rueda se lee como veredicto final, pero no lo es.** En ambas tareas, cuando la rueda para en Carla el usuario da por sentado "ganó ella" y busca la confirmación — pero el único botón es "Al Oráculo →", que reabre el proceso. En T1 (Step 4) esto convierte una "espinita" en certeza y lo pone "con la guardia arriba"; en T2 (Step 3) es la "primera grieta" que arranca la caída de confianza. La promesa temprana "La Rueda elige, la Bola confirma" no comunica que ese segundo factor sea **reversible**, así que ambos flujos sienten que un resultado ya visible puede caerse. Es la raíz común de toda la fricción posterior.

2. **Las dos plegarias "bendice / aparta" sugieren falsamente que el usuario controla el desenlace.** En las dos tareas (T1 Step 5, T2 Step 4) el usuario no sabe si su elección de plegaria decide el resultado o si solo elige la pregunta, y si la bola puede rechazar al elegido igual. Genera expectativas incorrectas sobre la aleatoriedad y una sensación de manipulación/ilegitimidad. Baja la claridad de "High" a "Medium" en ambos recorridos exactamente en este punto.

3. **La cadena de botones se percibe como un rodeo largo para algo simple.** "Al Oráculo →" → "Sacudila por mí" → "Que se cumpla" posterga la confirmación y mantiene abierta la duda de finalidad. En T1, con desenlace favorable, el usuario igual lo describe como "todo este teatro del oráculo fue un rodeo largo"; en T2 la misma cadena, repetida, se vuelve un "carrusel sin final". El tema lúdico se tolera bien en ambos casos: la fricción es estructural, no estética.

### Hit one role (segmented)

*Un solo rol corrió; estos hallazgos aparecieron solo en el escenario de la rama "no" (T2), que cualquier sorteo real dispara ~50% de las veces.*

1. **El modal de rechazo "EL APARTADO" es idéntico al de ganador.** Solo T2 (Step 6) lo alcanza. Mismo sello oficial, mismo "EL ORÁCULO HABLÓ", mismo número de veredicto y mismo botón "Llevarse el veredicto", pero celebra una **eliminación**. Produce un "pinchazo de esperanza" seguido de decepción y destruye la credibilidad de toda señal de cierre posterior: si el cartel solemne también sirve para descartar, ninguna confirmación es creíble. T1 fue inmune únicamente porque el oráculo dio "sí" y nunca vio esta pantalla.

2. **Ambigüedad "apartado vs. eliminado".** Solo T2 (Steps 6–7). El usuario no sabe si el nombre vuelve o desaparece para siempre; al ver "03/04" y que Carla ya no está, confirma "el supuesto peor: el descarte es permanente" y lo vive como progreso perdido e injusto.

3. **"Que se cumpla / Está cumplido" promete cierre y entrega otra ronda.** Solo T2 (Steps 5, 10). El copy anuncia finalidad justo cuando el flujo reabre; en el Step 10 es la gota que dispara el abandono: el usuario se niega a tocar el botón y declara el sorteo no resuelto.

4. **Bucle percibido como infinito.** Solo T2. Con "no" repetidos el usuario pierde la cuenta de rondas y nombres caídos sin ver horizonte de ganador, y corta.

### Split a contrasted pair (pole-specific)

No contrasted pairs in this autopilot run.

## Emotional arcs compared

Los dos arcos arrancan idénticos: "tranquilo, con todo bajo control", cargando nombres y avanzando sin trabas. Divergen en el mismo instante — cuando la rueda para en un nombre y aparece "Al Oráculo →" — y ahí ambos pasan a "guardia arriba". El punto de bifurcación es puramente el desenlace de la bola. En T1 el "Sí" afloja la tensión y el sello fechado del modal entrega un cierre "legítimo y oficial" que satisface la necesidad de finalidad del perfil: termina en alivio pese a sentir el camino largo. En T2 el primer "no" convierte el fastidio en desconfianza ("si se repite, corto"), el modal de descarte con sello lo hace sentir "engañado", y el segundo "no" lo lleva a rabia contenida y abandono activo. Misma persona, mismo diseño: la única variable que separa "alivio" de "traición" es un resultado azaroso que el usuario no controla — y el diseño no lo prepara para esa posibilidad.

## Detected risks

- Usuarios orientados al resultado abandonan sin ganador porque el flujo **puede deshacer** lo que ya leyeron como definitivo (rueda → oráculo).
- **Colisión de señales de cierre:** tratar un descarte con el mismo lenguaje solemne (sello, número, "EL ORÁCULO HABLÓ", "Que se cumpla") que el ganador erosiona la credibilidad de todas las confirmaciones, incluida la legítima.
- **Pérdida de confianza en la legitimidad** del sorteo: un mecanismo que elimina nombres sin coronar a nadie se percibe como injusto o roto, no como lúdico.
- **Ambigüedad "apartado vs. eliminado":** el usuario interpreta mal el estado del pool y siente progreso perdido.
- Las plegarias "bendice/aparta" crean falsa sensación de control sobre un resultado aleatorio.
- Con "no" repetidos, riesgo de **bucle sin horizonte de finalización** y abandono, más probable cuanto más grande el grupo.
- Un desenlace inesperado (p. ej. un "quizás", si existiera) se leería como error o cuelgue, no como reintento.

## Structural insight

Viendo las dos corridas juntas, el problema no es el tema del oráculo — que el perfil tolera en ambos casos — sino que **la jerarquía visual y verbal no distingue "avanzaste hacia un ganador" de "perdiste un candidato".** El producto reserva su lenguaje más fuerte de cierre y oficialidad (sello, número, "EL ORÁCULO HABLÓ") tanto para coronar como para descartar, y su promesa temprana "la Bola confirma" oculta que ese segundo factor es reversible. El resultado es un diseño que funciona solo cuando el azar coopera (T1) y colapsa cuando no (T2), sin que el usuario tenga cómo anticiparlo. El cierre fuerte que hace ganar a T1 es exactamente la señal que traiciona a T2: la interfaz grita "cerrado/oficial" en el momento en que en realidad reabre el proceso.

## Fix this first

En el **modal de rechazo "EL APARTADO" (T2, Step 6)**, quitarle el sello oficial, el número de veredicto, el título compartido "EL ORÁCULO HABLÓ" y el botón "Llevarse el veredicto", y convertirlo en una tarjeta claramente secundaria (tono neutro, sin sello, copy tipo "Descartado · quedan N en juego" y único CTA "Seguir girando →"), reservando el tratamiento solemne y exportable exclusivamente para el ganador — esto rescata a cualquier usuario que caiga en la rama "no" (≈50% de las bolas), el escenario que provocó el único abandono.

## Potential improvements

| # | Screen / moment | Actionable change | Why it matters | Who it affects |
|---|-----------------|-------------------|----------------|----------------|
| 1 | Modal de rechazo "EL APARTADO" (T2 Step 6) | Quitar sello, número de veredicto, título compartido y "Llevarse el veredicto"; tarjeta neutra con "Descartado · quedan N en juego" y CTA único "Seguir girando →". Reservar lo solemne solo para el ganador. | Punto de máxima confusión y detonante del abandono: un descarte hoy se ve idéntico a una victoria y destruye toda señal de cierre. | Todo usuario que caiga en "no" (~50% por tirada) |
| 2 | Wheel result (T1 Step 4 / T2 Steps 3, 8) | Reetiquetar estado y botón para que la rueda no se lea como veredicto: "Candidato en juego: Carla" + CTA "Someter al Oráculo →" en vez de sugerir "ganó Carla". | Raíz estructural común: el supuesto "la rueda decide" convierte el paso siguiente en traición y arranca la caída de confianza en ambas tareas. | Todos los usuarios |
| 3 | Botón/cartel de resultado "no" (T2 Steps 5, 10) | En un "no", cambiar "Que se cumpla / Está cumplido" por "Descartar y volver a girar →" para que el copy anticipe la consecuencia real. | Prometer "está cumplido" y devolver otra ronda es la gota que dispara el abandono. | Usuarios en rama "no" |
| 4 | Plegarias "bendice / aparta" (T1 Step 5 / T2 Step 4) | Aclarar que las plegarias solo eligen la pregunta y que el resultado es aleatorio, o simplificar a una sola plegaria por defecto sin exponer "aparta". | Fuente de duda en ambas tareas: sugiere control sobre el azar y alimenta la sensación de manipulación/ilegitimidad. | Todos los usuarios |
| 5 | Wheel con pool reducido (T2 Step 7) | Mostrar explícitamente "Carla quedó fuera del sorteo · REBAÑO 03/04" con microcopy de que el descarte es permanente. | Elimina la ambigüedad "apartado vs. eliminado" que hace sentir el progreso perdido e injusto. | Usuarios en rama "no" |
| 6 | Ley del Oráculo (T1/T2 Steps 1–3) | Ampliar "La Rueda elige, la Bola confirma" con nota funcional: "dos pasos — primero sale un nombre, después se sella; puede rechazarse", visible antes de girar. | Prepara al decisor pragmático para la estructura de dos factores reversibles y evita la sorpresa del paso extra. | Todos los usuarios |
| 7 | Cadena de botones (T1 Steps 4–6) | Fusionar "Sacudila por mí" + "Que se cumpla" o hacer que un "sí" transicione automáticamente al modal. | Reduce el rodeo de tres clics que posterga la confirmación y mantiene la duda de finalidad abierta de más. | Todos los usuarios |
