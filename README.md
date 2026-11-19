# Design System Workbench

A production-quality design system: accessible React components, a
two-tier design token system with light/dark theming, and an interactive
documentation/playground app — built as a demonstration of frontend
platform engineering.

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
| [`packages/ui`](./packages/ui) | Accessible React components. Layout: Container, Stack, Inline, Grid. Type: Heading, Text. Controls: Button, Link, TextField, Select, Checkbox, CheckboxGroup, Switch, RadioGroup, Fieldset. Content: Card, Badge, Alert, Tabs, Dialog |
| [`packages/tokens`](./packages/tokens) | Three-tier tokens (primitive → semantic → component), three brands (Iris, Volt, Bloom) × light/dark, fonts, contrast audit; no React dependency |
| [`packages/mcp`](./packages/mcp) | MCP server for coding agents: components, tokens per brand × mode, contrast, style linting |
| [`packages/eslint-config`](./packages/eslint-config) | Shared flat ESLint config, including the `dsw/no-raw-style-values` token rule |
