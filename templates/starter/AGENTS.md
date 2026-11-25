# App on the @dsw design system

This app is built with `@dsw/ui` and `@dsw/tokens`. This file is for any
coding agent; Claude Code reads it through `CLAUDE.md`.

## Ask the dsw MCP server before guessing

`@dsw/mcp` is a dev dependency: point your agent's MCP config at
`npx dsw-mcp` (stdio). It answers from the installed release, so it
matches the components you actually have.

- `suggest_component`: "what do I use for a modal / status pill / toast?" It also says when the system has nothing yet.
- `get_component`: props and examples, before using a component.
- `find_token_for_value`: the token for a hex or px value. Never hard-code either.
- `check_contrast`: any new colour pair, in all 6 themes.
- `lint_styles`: the design-system lint rules, on code you just wrote.

## Building UI

- **Compose from `@dsw/ui` only:** `Container`, `Stack`, `Inline` and `Grid` for layout, `Heading` and `Text` for type, `Card` for sections. `src/App.tsx` is the pattern: a full screen with no styles of its own.
- **If you need `stylex.create`,** a component or prop is probably missing. Say so instead of building a one-off.
- **Theme:** `ThemeProvider` in `src/main.tsx` puts the brand × mode theme on `<html>`. Change it with `useTheme()`; never put a theme class on another element.
- **Accessibility that axe can't see:** button and link text says what it does ("Remove Ada", not "Remove"), every field has a visible `label`, and messages after an action use `Alert announce`.

## Before finishing

```bash
npm run typecheck && npm run lint && npm run smoke
```

`npm run smoke` runs axe in all 3 brands × light/dark. Lint uses
`@dsw/eslint-plugin`, the same rules the design-system team's CI uses.
