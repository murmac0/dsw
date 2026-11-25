# @dsw starter

A Vite + React app set up the way an app team should start on the @dsw
design system:

- `@dsw/ui` components and `@dsw/tokens` themes, compiled by StyleX's Vite plugin
- `ThemeProvider` putting the brand × mode theme on `<html>`, with a brand and dark-mode switcher
- ESLint with `@dsw/eslint-plugin`'s `recommended` rules
- Agent instructions: `AGENTS.md` for any coding agent, and a `CLAUDE.md` that imports it and enables the `dsw` Claude Code plugin (MCP server and skills)
- A Playwright smoke test: styles load, themes apply, axe passes in all 6 themes

## Start

Copy this folder, then:

```bash
npm install
npm run dev
```

Before a pull request:

```bash
npm run typecheck && npm run lint && npm run smoke
```

`npx playwright install chromium` once, for the smoke test.

## In the design-system repo

This folder is a workspace package, so it's typechecked and linted with
everything else. `pnpm test:consumer` packs every `@dsw/*` package, installs
this starter from those packs outside the workspace, and runs its checks,
the MCP server, the codemod and the lint rules: the proof that an app team
can actually use a release.
