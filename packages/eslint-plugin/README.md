# @dsw/eslint-plugin

Lint rules for apps built on `@dsw/ui`, plus `dsw-migrate`, a codemod
that moves existing UI onto the design system. The same rules run in
the `@dsw/mcp` server's `lint_styles`, so agents and CI agree.

```js
// eslint.config.js
import dsw from "@dsw/eslint-plugin";
export default [...yourConfig, dsw.configs.recommended];
```

## Rules

| Rule | `recommended` | What it catches |
|---|---|---|
| `no-raw-style-values` | error | Hardcoded colours, lengths, durations, weights in `stylex.create()`. `// token-exempt: <reason>` for real one-offs |
| `no-primitive-tokens` | error | Imports from `@dsw/tokens/primitives.stylex` (not themed, not contrast-audited) |
| `no-token-barrel` | error | Value imports from `@dsw/tokens` (StyleX can't trace through the barrel) |
| `prefer-ds-components` | error | `<button>`, `<a href>`, `<h1>`–`<h6>`, inputs, `<select>`, `<dialog>`, `<fieldset>` where @dsw/ui has a component |
| `no-react-aria-direct` | error | Component imports from React Aria. Types and providers are allowed |
| `prefer-layout-primitives` | warn | A `stylex.create` style that's only flex or grid with a gap: use Stack, Inline or Grid |
| `no-inline-style` | warn | `style={{…}}` objects |

`configs.library` is the token rules alone, for code inside @dsw/ui.

## Codemod

```bash
npx dsw-migrate src --dry-run   # what would change, and what needs a person
npx dsw-migrate src             # apply
```

It only rewrites conversions that keep behaviour identical, and adds the
imports:

```diff
- <button onClick={() => save()} disabled={busy}>Save</button>
+ <Button onPress={() => save()} isDisabled={busy}>Save</Button>
- <a href="/help" target="_blank" rel="noopener noreferrer">Help</a>
+ <Link href="/help" isExternal>Help</Link>
- <h2 id="plan">Plan</h2>
+ <Heading level={2} id="plan">Plan</Heading>
```

Some elements need a decision, so they're listed with file and line
instead of rewritten:
- a `className` or `style` (which variant?)
- a spread
- a handler that reads the DOM event
- an `<input>` (it needs a label)
