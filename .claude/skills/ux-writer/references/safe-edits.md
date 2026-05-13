# Safe Edits

Hard rules when rewriting copy. These exist so a tone experiment never breaks the product.

## 1. Preserve every i18n key

Never rename a key. Never add a key (unless the user explicitly asks for new copy). Never delete a key. Tone changes operate on **values only**.

If the audit reveals a missing/orphan key, surface it in the report — let the user decide whether to add or remove. Don't do it unilaterally.

## 2. Preserve every interpolation token

If the original value contains `{{name}}`, `{{n}}`, `{{count, plural, ...}}` or any `{...}` token, the new value must contain **the same set of tokens** (set, not order). Different libraries use different syntaxes:

- `{{name}}` — i18next (default)
- `{name}` — react-intl, FormatJS
- `%s`, `%(name)s` — printf-style
- `${name}` — some custom setups

When in doubt, treat anything that looks like a placeholder as one and keep it.

The order of tokens in the new sentence can change if the language naturally reorders them. *Counts of each token must match.*

**Example.** Original ES: `"¿La suerte bendice a {{name}}?"` → new ES: `"{{name}} — ¿lo bendice el universo?"`. One `{{name}}` in, one `{{name}}` out. OK.

## 3. Preserve every HTML tag

Some copy contains inline HTML for emphasis or styling:

```json
"heading": "We have a <em style=\"font-weight:500;color:var(--accent)\">winner.</em>"
```

The new value must contain the same tags with the same attributes. Move them around inside the sentence if needed, but don't drop them and don't add new ones (the design relies on them).

The text *between* tags can be rewritten freely.

## 4. Preserve JSON validity

Quote any literal `"` inside strings as `\"`. Quote newlines as `\n` if they exist (rare in UI copy — usually a sign you shouldn't).

After every edit, the file must `JSON.parse()` cleanly. The `scripts/check_parallel.py` validator will catch this, but be careful when editing manually.

## 5. Honor length budgets

UI copy can't grow unbounded — the layout was designed against a certain length range. Approximate budgets:

| Element type (key hints) | Max length suggestion |
|---|---|
| Eyebrow, badge, label (`*.eyebrow`, `*.badge`, `*.label`) | ≤ 28 chars |
| Button / CTA (`*.cta`, `*.button`, `*.action`) | ≤ 24 chars |
| Heading (`*.heading`, `*.title`) | ≤ 60 chars; let the line break naturally |
| Subhead / lede (`*.subtitle`, `*.lede`) | ≤ 140 chars |
| Body / paragraph (`*.body`, `*.description`) | ≤ 280 chars |
| Hint / footnote (`*.hint`, `*.footnote`, `*.minHint`) | ≤ 80 chars |
| Answer / one-liner (`*.answers.*`, `*.options.*`) | ≤ 40 chars |
| Stamp / seal text (`*.stampLabel`) | ≤ 36 chars |

These are *guidelines*. Cross them by ~20% if the new voice demands it, but never double a string. If the new tone really needs more words, surface it to the user before applying — the design might need to change.

The **inverse** also matters: don't shrink a 200-char body to "Yep." just because the new voice is terse. The string carries weight on the screen; collapsing it leaves a void.

## 6. Cross-locale rules

When ES and EN exist as parallel translations:

- Apply the **same tone in each language**, not the same words. Word-for-word translations across a tone change usually feel off in one of the two languages.
- Keep them **roughly the same length** (±30%). If ES is 2 lines and EN is 6 lines, the layout will break in one of them.
- Same set of interpolation tokens in both.
- Same set of HTML tags in both.
- Honor the **language-specific lever** from `voice-framework.md` — e.g. "more casual" pulls voseo + contractions in ES, contractions + sentence fragments in EN.

## 7. Things that look like copy but aren't

Some i18n values are configuration, not copy. Look out for:

- Date/number formats (`"MM/dd/yyyy"`, `"###,###.00"`) — don't touch.
- ICU plural / select rules (`"{count, plural, one {# item} other {# items}}"`) — touch only the words *inside the braces*, not the structure.
- Boolean-ish strings (`"true"`, `"yes"`, `"on"`) — don't touch.

If a value is suspiciously short, all uppercase, or matches a known format string, leave it alone or ask.

## 8. Proper nouns and brand stamps

Don't change unless the user asks:

- Product / app names ("2FS", "Magic 8 Ball")
- Section conventions the brand has committed to ("EDICIÓN Nº {{n}}", "SORTEO")
- The wordmark glyph itself ("2fs°")

These are part of the visual identity, not the voice. If the user wants to rebrand, that's a separate conversation.

## 9. Verify after every edit

Run `scripts/check_parallel.py` against the locale files. It checks:

- Same key tree across all locales.
- Same set of interpolation tokens per key, per locale.
- All values are non-empty strings.
- JSON parses.

If it complains, fix before reporting "done" to the user. A subtle missing `{{name}}` produces a "Hola, " in the running app, and the user will find it before you do.
