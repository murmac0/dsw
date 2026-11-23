# dsw: Claude Code plugin for the @dsw design system

Gives coding agents in your app repo the design system: what exists, how
to use it, and the same rules CI enforces.

| Part | What it does |
|---|---|
| `dsw` MCP server | Components and props, tokens per brand and mode, value → token lookup, contrast checks, the lint rules, guidelines, and `suggest_component` for "what do I use for a modal?" |
| `/dsw:build-screen` | Builds a page from @dsw/ui only: outline, component mapping, composition, accessibility, verification |
| `/dsw:review-ui` | Reviews a diff or files: lint rules plus the judgement calls lint can't make |
| `/dsw:migrate-to-dsw` | Runs the `dsw-migrate` codemod, then finishes the cases it leaves |

Claude also uses the skills on its own when a request fits ("build a
billing page", "review this PR's UI").

## Install

In Claude Code, from your app repo:

```
/plugin marketplace add <this repository's git URL>
/plugin install dsw@dsw
```

The plugin starts the server with `npx --package=@dsw/mcp dsw-mcp`, so it
needs `@dsw/mcp` from your registry. It uses your installed copy if
you've added it as a dev dependency, which also pins the version:

```bash
npm install -D @dsw/mcp @dsw/eslint-plugin
```

## Lint and codemod for the same rules

```js
// eslint.config.js
import dsw from "@dsw/eslint-plugin";
export default [...yourConfig, dsw.configs.recommended];
```

```bash
npx dsw-migrate src --dry-run
```
