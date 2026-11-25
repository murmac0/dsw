# Design System Workbench

pnpm + Turborepo monorepo for a themeable React design system.

- `packages/tokens` (`@dsw/tokens`): StyleX tokens with three tiers, plus themes, the contrast audit and the token export.
- `packages/ui` (`@dsw/ui`): React 19 components built on react-aria-components, plus the component manifest.
- `packages/mcp` (`@dsw/mcp`): MCP server over the generated token and component data. Runs from source here; `pnpm --filter @dsw/mcp build` bundles it for other repos.
- `packages/eslint-plugin` (`@dsw/eslint-plugin`): the design-system lint rules (tokens, DS components over native elements, layout primitives) and the `dsw-migrate` codemod. One source of truth for CI, editors and the MCP server's `lint_styles`.
- `packages/eslint-config`: shared lint config for this repo, built on the plugin's `library` preset.
- `templates/starter`: the app teams' starter (Vite, `ThemeProvider`, lint, Claude Code plugin, Playwright smoke test). `pnpm test:consumer` proves a packed release works in it.
- `plugins/dsw`: the Claude Code plugin for app teams (MCP server plus build-screen, review-ui and migrate-to-dsw skills), listed in `.claude-plugin/marketplace.json`.
- `apps/workbench`: Vite demo app, Storybook (stories live in `packages/ui`) and the Playwright E2E suite.

Read ARCHITECTURE.md for the reasoning behind the design. Read ACCESSIBILITY.md before changing any interactive behaviour.

## Use the MCP tools first

`.mcp.json` registers two servers:

- **`dsw`**: this repo's own server.
- **`storybook`**: Storybook's server, available only while `pnpm storybook` is running.

Before writing UI code, ask `dsw` rather than guessing:

- **`get_component`**: check this before building something new. It gives the props, the tokens used and the stories.
- **`search_tokens`, `get_token` and `find_token_for_value`**: never hand-pick a hex value or px size.
- **`check_contrast`**: use it for any new foreground and background pair, in all 6 themes.
- **`suggest_component`**: maps a need in plain words ("status pill", "modal") to a component, and says when the system has nothing for it yet.
- **`lint_styles`**: run it on new style code before finishing. Use scope `"library"` for code inside `packages/ui`, which is made of native elements and React Aria.

## Commands

Use Node 24 (`nvm use` reads `.nvmrc`). Run these from the repo root:

```bash
pnpm typecheck && pnpm lint && pnpm test   # all packages
pnpm test:e2e                              # Playwright; builds + serves the workbench on :4173
pnpm dev                                   # workbench on :5173
pnpm storybook                             # Storybook on :6006
pnpm --filter @dsw/tokens export           # regenerate packages/tokens/generated
pnpm --filter @dsw/ui manifest             # regenerate packages/ui/generated
pnpm test:consumer                         # pack every @dsw package, install templates/starter from the packs, run its checks
```

`pnpm test` fails if either generated folder is out of date. Regenerate them and commit them along with the source change.

## Rules that aren't obvious from the code

- **Use tokens only.** Inside `stylex.create`, the values must be tokens. Allowed exceptions:
  - Percentages, `0`, keywords and forced-colours system colours (`Canvas`, `CanvasText`, `Highlight`, `GrayText`).
  - A real one-off marked with `// token-exempt: <reason>`.
- **Components never import `primitives.stylex`.** Use semantic tokens (`@dsw/tokens/semantic.stylex`) or component tokens (`@dsw/tokens/components.stylex`).
  - **Colour:** every colour a component paints comes from its own `*Tokens` group. These are themed per light/dark mode.
  - **Shape:** radius, border weight and type come from its `*Shape` group. These are themed per brand.
- **Themes go on `<html>`,** exactly one `themes[brand][mode]` list at a time. Component aliases resolve at `:root`, so a theme class on a nested element only half-applies.
- **Brand lists are complete.** Each brand × mode list in `themes/volt.ts` and `themes/bloom.ts` repeats its shape themes. If you add a `createTheme` override, add it to that brand's `shared` array.
- **Contrast:**
  - Every colour pairing a component paints must be listed in `packages/tokens/src/contrast.ts`.
  - Text needs 4.5:1 and UI boundaries need 3:1, in all 6 themes.
  - The Foundations page and the E2E suite check this list.
- **Controlled and uncontrolled:** every stateful component supports both. Use `value`/`isSelected` + `onChange`, or `defaultValue`/`defaultSelected`, and pass the props through to react-aria.
- **Disabled state:** form controls call `useInheritedDisabled(props.isDisabled)` so a disabled `Fieldset` disables them.
- **Forced colours:** anything drawn only with fills (tracks, dots, selected items) needs `forcedColorAdjust: "none"` plus system colours under `breakpoints.forcedColors`. E2E checks this by comparing pixels, because computed styles don't reflect forced colours.
- **Motion:** this is token-level. Motion durations drop to 0 under reduced motion, so use the `motion` tokens and don't write your own media query for it.
- **TypeScript is strict:** `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are on. Spread optional props conditionally: `{...(x !== undefined && { x })}`.
- **Dependencies:** only use package versions released at least two weeks ago, per the repo's `minimumReleaseAge` policy.

## Building screens

Compose pages from `@dsw/ui` alone: `Container`, `Stack`, `Inline` and
`Grid` for layout, `Heading` and `Text` for type, `Card` for sections.
App code should rarely need `stylex.create`; reaching for it usually
means a component or prop is missing. The workbench's "Example page" tab
(`apps/workbench/src/pages/SettingsPage.tsx`) is the reference: a full
settings page with no styles of its own.

## Rules for app teams

Rules in `@dsw/eslint-plugin` are what app teams' CI enforces, so treat a
change to one as a change to the public contract. Add RuleTester cases for
every new behaviour; `prefer-ds-components` fixes must only rewrite code
whose behaviour is unchanged (the codemod applies them unattended).
After changing the plugin or the MCP server, run
`pnpm --filter @dsw/mcp build` and pack-test it as the README describes.

## Adding a component

Use the `add-component` skill (`.claude/skills/add-component/SKILL.md`). It is the full checklist; several of its steps are easy to miss.

## Verifying UI changes

Unit tests run in jsdom, so they don't prove anything about visuals. For anything visible:

- Run `pnpm test:e2e`, which includes axe in all 6 themes, aria snapshots, contrast, forced colours and reflow.
- Look at the workbench preview (the `workbench` entry in `.claude/launch.json`) in more than one brand.
