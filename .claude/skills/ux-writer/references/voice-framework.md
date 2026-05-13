# Voice & Tone Framework

A compact toolkit for naming, comparing, and moving voice/tone deliberately.

## Voice vs tone

- **Voice** = the stable personality. Should feel like one writer wrote everything.
- **Tone** = the situational dialing. The error message has a different tone from the welcome screen, but they share a voice.

When the user says "let's try a more [X]", clarify in your head: are they moving voice (the whole personality) or just tone (the dial)? Usually it's voice — be ready to commit to the bigger move.

## The voice card

Use these six axes. Fill them in whenever you read or rewrite copy.

### 1. Personality

A short noun phrase. The "who is talking" line.

Good: *"a newspaper editor who moonlights as an oracle"*, *"a friendly barista"*, *"a deadpan customer-service bot"*, *"a melodramatic stage magician"*

Bad: *"professional"*, *"engaging"*, *"clear"* — these mean nothing.

### 2. Register

How formal, on a 1-5 scale, plus the language-specific lever:

| 1 — Slang | 2 — Casual | 3 — Neutral | 4 — Formal | 5 — Ceremonial |
|---|---|---|---|---|

- **Spanish**: voseo (1-2), tuteo (2-4), ustedeo (4-5). Decide once and hold it.
- **English**: contractions allowed (1-3) vs banned (4-5). Slang words (1-2). Latinate diction (4-5).
- **Portuguese**: você (2-4), tu (regional 1-3), o senhor / a senhora (5).

### 3. POV

Who's talking to whom:

- **1pl** *("Buscamos…")* — collective, brand as a team
- **2sg** *("Decidí…")* — direct, in-product instructions
- **3sg passive** *("Se ha hablado.")* — ceremonial, editorial
- **Imperative** *("Tirá la rueda.")* — instructions
- **Avoid mixing.** If the buttons say "Crear" (imperative) but the help text says "Creamos" (1pl), that's a smell.

### 4. Sentence shapes

How long? Punchy and short? Long flowing? Aphoristic? Question-driven?

Look for the **shape of the dominant sentence** and the **shape of the rare one** (the rare one is usually where voice peaks).

Examples:
- "Short imperatives + occasional Fraunces italic aphorism" (2FS today)
- "Conversational fragments + parenthetical asides"
- "Long, balanced declaratives — no questions"

### 5. Lexicon

The 5-10 words that are *load-bearing*. Specific nouns that recur, metaphors the product leans on, accent words the user notices.

For 2FS today: *urna · bola · suerte · destino · ungido · apartado · Casa · edicto · sorteo · "Así está escrito, así se cumple."*

Also note **banned words**: things the voice would never say. ("Submit", "engage", "leverage" if you're going casual; emojis if you're going editorial; etc.)

### 6. Punctuation & typography

The visual fingerprint:

- Final periods in headlines? (often a tone signal — period = serious, no period = casual UI)
- Em-dashes? Ellipses? Slashes?
- Eyebrows in ALL CAPS / mono / italic?
- Em-dash for asides vs parens?
- Sentence-case or Title-Case for headings?
- Trailing exclamation marks?

## Language-specific tone levers

When moving tone in ES + EN in parallel, pull the equivalent lever in each language:

| Tone move | Spanish lever | English lever |
|---|---|---|
| More casual | voseo, contracciones ("p'al", "pa'"), interjections | contractions, sentence fragments, "you" + "we" |
| More formal | ustedeo, no contracciones, perífrasis | no contractions, longer subordinate clauses, Latinate verbs |
| More dramatic | retórica, frases breves, aforismos | short sentences, biblical cadence, allusion |
| More dry/deadpan | reducir adjetivos, frases declarativas planas | drop intensifiers, prefer noun phrases, no exclamations |
| More playful | hipérbole, juegos de palabras, pregunta retórica | puns, asides in parens, soft hyperbole |
| More terse | borrar conectores, imperativo simple | drop articles where natural, imperative + period |
| More funny | absurdism, casual aside, mismatch of register vs subject | dry irony, anticlimax, sudden specificity |

## Sample voice cards (for reference)

### "Editorial newspaper editor + biblical oracle" (2FS today)
- Personality: a 19th-century newspaper editor who runs a parish bingo on the side
- Register: 4 (formal-ish), ustedeo-leaning, full sentences with periods
- POV: 3rd-person passive ("ha sido señalado"), occasional imperative ("Tirá la rueda")
- Shapes: short eyebrows + display headlines + aphoristic closers ("Así está escrito, así se cumple.")
- Lexicon: urna · bola · suerte · destino · ungido · apartado · Casa · edicto
- Typography: ALL CAPS mono eyebrows, Fraunces italic for emphasis, periods on every headline

### "Late-night talk-show host" (a sample target)
- Personality: a deadpan host who's seen too many of these
- Register: 2 (casual), tuteo, full contractions
- POV: 2sg direct
- Shapes: short, conversational, rhetorical asides
- Lexicon: "el universo no contestó", "Magic Ball dice que no, y la Magic Ball es ley"
- Typography: lowercase headings, em-dashes for asides, no terminal periods on UI labels

### "Mediumweight SaaS default" (the boring fallback to avoid)
- Personality: a competent but anonymous brand voice
- Register: 3, neutral
- POV: mix of 1pl and 2sg
- Shapes: medium-length, no rhetorical risk
- Lexicon: "Continuar", "Empezar", "Tu perfil"
- Typography: title case headings, no terminal periods

If your audit / transform output sounds like the SaaS default, you've lost the brand. Push back the other way.
