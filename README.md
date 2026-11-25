# Design System Workbench

A production-quality design system: accessible React components, a
three-tier design token system (primitive → semantic → component) with
three brands in light and dark, an interactive documentation/playground
app, and tooling for the teams and AI agents that consume it: ESLint
rules, a migration codemod, an MCP server and a Claude Code plugin.
Built as a demonstration of frontend platform engineering.

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for the WCAG 2.2 AA review and how it's enforced, and [ARCHITECTURE.md](./ARCHITECTURE.md) for the reasoning behind the
non-obvious decisions (StyleX's compiler constraints, token tiering, the
accessibility pattern behind `Button`'s loading state, and the environment
version pins).

## Stack

React · TypeScript (strict) · Vite · pnpm workspaces · Turborepo ·
StyleX · Storybook · Vitest + React Testing Library · Playwright

## Requirements

- Node ≥ 22 (this repo was built against 24.22.2 — see `.nvmrc`)
- pnpm (`corepack enable` or `npm install -g pnpm`)

## Getting started

```bash
pnpm install
pnpm dev
```

```bash
pnpm storybook
```

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter @dsw/workbench test:e2e
```

## Packages

| Package | What it is |
|---|---|
| [`apps/workbench`](./apps/workbench) | Interactive docs site: Components / Foundations / Playground |
| [`packages/ui`](./packages/ui) | Accessible React components. Layout: Container, Stack, Inline, Grid. Type: Heading, Text. Controls: Button, Link, TextField, Select, Checkbox, CheckboxGroup, Switch, RadioGroup, Fieldset. Content: Card, Badge, Alert, Tabs, Dialog. App: ThemeProvider |
| [`packages/tokens`](./packages/tokens) | Three-tier tokens (primitive → semantic → component), three brands (Iris, Volt, Bloom) × light/dark, fonts, contrast audit; no React dependency |
| [`packages/mcp`](./packages/mcp) | MCP server for coding agents: components, tokens per brand × mode, contrast, linting, component suggestions. Publishable as a bundled `dsw-mcp` bin |
| [`packages/eslint-plugin`](./packages/eslint-plugin) | Lint rules for apps on @dsw/ui (tokens, DS components, layout primitives) and the `dsw-migrate` codemod |
| [`packages/eslint-config`](./packages/eslint-config) | This repo's shared flat ESLint config |
| [`templates/starter`](./templates/starter) | Starter app for teams: ThemeProvider, lint, Claude Code plugin and a smoke test. `pnpm test:consumer` installs it from packed releases and runs every check |
| [`plugins/dsw`](./plugins/dsw) | Claude Code plugin for app teams: the MCP server plus build-screen, review-ui and migrate-to-dsw skills |
