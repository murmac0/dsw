# @dsw/mcp

An [MCP](https://modelcontextprotocol.io) server that gives coding agents
(Claude Code, Cursor, …) the design system's knowledge and rules, so the
UI they generate stays on-system.

## Use it

It's registered in the repo's `.mcp.json`, so Claude Code picks it up when
opened in this repo (approve it once when prompted). Any other client:

```json
{ "command": "node", "args": ["packages/mcp/src/stdio.ts"] }
```

Needs Node ≥ 22.18 (built-in TypeScript type stripping; this repo pins 24).

**In other repos** (app teams): install the published package, or the
`dsw` Claude Code plugin (`plugins/dsw`), which runs it with
`npx --package=@dsw/mcp dsw-mcp`. Build and check the package:

```bash
pnpm --filter @dsw/mcp build   # dist/: bundled server + data
cd packages/mcp && pnpm pack   # the tarball a registry would get
```
`.mcp.json` also registers Storybook's MCP server (`localhost:6006/mcp`, while
`pnpm storybook` runs) for story previews; this server covers what Storybook
can't: tokens per brand × mode, contrast and the style rules.

## Tools

All read-only.

| Tool | Answers |
|---|---|
| `list_components` / `get_component` | What exists; props with real types, controlled/uncontrolled pairs, token groups, audited contrast pairs, story ids, tests |
| `search_tokens` / `get_token` | Which token to use, its value in each of the 6 themes, what it aliases, touch / reduced-motion variants |
| `find_token_for_value` | `#6a58ee` / `12px` / `150ms` → the token, using the CSS property as intent |
| `check_contrast` | WCAG ratio for colours or token pairs, per theme, and whether the pair is already audited |
| `suggest_component` | "a modal", "status pill", `<h2>` → the component to use, or "not in @dsw/ui yet" with a stand-in |
| `lint_styles` | Runs `@dsw/eslint-plugin` on code (scope `app` or `library`), with token suggestions for each raw value |
| `list_brands` / `get_guidelines` | Brands, fonts, how to apply a theme; sections of ARCHITECTURE.md / ACCESSIBILITY.md |

Resources: `dsw://components`, `dsw://tokens`, `dsw://tokens/{brand}/{mode}`
(DTCG), `dsw://docs/architecture`, `dsw://docs/accessibility`.

## Where the data comes from

StyleX's `defineVars()` only runs inside its compiler, so the server reads
generated manifests instead of importing tokens:

- `packages/tokens/generated/tokens.json` and `generated/dtcg/*.tokens.json`
  come from `pnpm --filter @dsw/tokens export`. Static analysis of the token
  sources resolves every alias, theme override and template value.
  `e2e/token-export.spec.ts` checks every token in every theme against the
  browser's computed values.
- `packages/ui/generated/components.json` comes from
  `pnpm --filter @dsw/ui manifest`, using the TypeScript checker and doc
  comments. Story ids are verified against Storybook's index.

Each package's `test` script fails if its generated file is stale.
