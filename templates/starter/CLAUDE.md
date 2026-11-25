# App on the @dsw design system

This app is built with `@dsw/ui` and `@dsw/tokens`. The `dsw` Claude Code
plugin (enabled in `.claude/settings.json`) adds the `dsw` MCP server and
the `/dsw:build-screen`, `/dsw:review-ui` and `/dsw:migrate-to-dsw` skills.

## Building UI

- **Compose from `@dsw/ui` only:** `Container`, `Stack`, `Inline` and `Grid` for layout, `Heading` and `Text` for type, `Card` for sections. `src/App.tsx` is the pattern: a full screen with no styles of its own.
- **Ask the `dsw` MCP server before guessing:** `suggest_component` for "what do I use for X", `get_component` for props, `find_token_for_value` instead of hex or px values.
- **If you need `stylex.create`,** a component or prop is probably missing. Say so instead of building a one-off.
- **Theme:** `ThemeProvider` in `src/main.tsx` puts the brand × mode theme on `<html>`. Change it with `useTheme()`; never put a theme class on another element.

## Before finishing

```bash
npm run typecheck && npm run lint && npm run smoke
```

`npm run smoke` runs axe in all 3 brands × light/dark. Lint uses
`@dsw/eslint-plugin`, the same rules the design-system team's CI uses.
