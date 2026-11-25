---
name: add-component
description: Add a new component to @dsw/ui end to end. Covers its component tokens (colour and shape), light/dark and brand overrides, contrast pairs, the component itself, stories, tests, the workbench demo and the regenerated token/manifest exports. Use when asked to create, add or build a new UI component in this repo, or to give an existing one its own token group.
---

# Add a component to @dsw/ui

This checklist covers the full set of steps. Each step names the file to change, and the "Why" notes say what goes wrong if you skip it. Use `Switch` (`packages/ui/src/components/Switch/`) as the reference: it touches every layer.

Below, `Name` is the PascalCase component name and `name` is camelCase (the token group prefix).

## 0. Check first

- Call the `dsw` MCP tool `list_components`, then `get_component` for anything close. The fix may be a new variant of an existing component, not a new component.
- Pick the react-aria-components primitive it wraps. Build on react-aria rather than writing focus, keyboard or ARIA handling by hand.
- Decide its states (hover, pressed, selected, disabled, invalid, focus-visible) and which colours each state paints, before writing tokens.

## 1. Component tokens: `packages/tokens/src/components.stylex.ts`

Add two groups:

```ts
/** One line on what the component is. */
export const nameTokens = stylex.defineVars({
  bg: color.bgSurface, // alias semantic tokens
  label: color.fgDefault,
  /** Say what it must contrast with, if anything. */
  edge: color.borderStrong,
  disabledLabel: color.fgDisabled,
});

export const nameShape = stylex.defineVars({
  radius: radius.md,
  borderWidth: borderWidth.thin,
});
```

- **`*Tokens`** holds colours only, themed by light/dark. **`*Shape`** holds radius, border weight, type, shadow and motion, themed by brand.
- Defaults alias **semantic** tokens. Use primitives only when no semantic token fits, and say why in a comment.
- Give each token a JSDoc comment when its contrast requirement isn't obvious. The comment ends up in the export and in the MCP output.

## 2. Theme overrides (only where an alias is wrong)

- **Dark** (`themes/dark.ts`): add a `createTheme(nameTokens, {...})` only if an aliased colour fails contrast in dark mode, as the switch track does. Append it to `darkTheme`.
- **Volt or Bloom** (`themes/volt.ts`, `themes/bloom.ts`): add `createTheme` overrides for whatever the brand restyles, usually `nameShape`. Add each one to that file's `shared` array.
  - **Why:** each brand × mode list must be complete. Two overrides of the same group on `<html>` have no defined winner, so never rely on two lists stacking.

## 3. Register the token group with the export

In `packages/tokens/scripts/export-tokens.ts`, add `name: "Name"` to `COMPONENT_OF`.

- **Why:** without this entry the tokens export with no `component`. Then `search_tokens({component})` in the MCP server and the manifest can't link them to the component.

## 4. Contrast pairs: `packages/tokens/src/contrast.ts`

Import `nameTokens` and add a `pair(...)` for every foreground and background combination the component paints:

```ts
// Name
pair("Name", "Label on surface", "text", nameTokens.label, color.bgSurface),
pair("Name", "Edge vs canvas", "ui", nameTokens.edge, color.bgCanvas),
```

- `"text"` needs 4.5:1. `"ui"` covers boundaries and state indicators and needs 3:1.
- Disabled states are exempt from contrast rules. Don't add pairs for them.
- Form controls are specified against `bgCanvas` **and** `bgSurface`.
- Before going further, check each pair with the `check_contrast` MCP tool. It reports all 6 themes. If one fails, fix the tokens (usually with a mode or brand override), never the threshold.

## 5. Regenerate the token export

```bash
pnpm --filter @dsw/tokens export
```

Commit `packages/tokens/generated/`. The output lists the contrast results. Every pair must say it passes.

## 6. The component: `packages/ui/src/components/Name/`

Create `Name.tsx` and `index.ts` (which re-exports the component and `NameProps`). Patterns to follow, all visible in `Switch.tsx`:

- **Styles:** `stylex.create` at the top of the file. Use only `@dsw/tokens/semantic.stylex`, `@dsw/tokens/components.stylex` and `@dsw/tokens/breakpoints.stylex`. Never import `primitives.stylex`.
  - Alias the groups: `import { nameTokens as t, nameShape as shape } from "@dsw/tokens/components.stylex"`.
- **Props:** `interface NameProps extends Omit<AriaXProps, "className" | "style" | ...>`, so consumers style it through tokens rather than overriding them.
- **`forwardRef`,** typed to the rendered element.
- **Controlled and uncontrolled:** pass react-aria's `value`/`defaultValue` (or `isSelected`/`defaultSelected`) and `onChange` straight through. Show both forms in the JSDoc.
- **JSDoc on the component:** say when to use it, and when to use something else instead. The manifest and the MCP server's `get_component` read this.
- **Form controls:** `const isDisabled = useInheritedDisabled(rest.isDisabled)` (from `../Fieldset/FieldsetContext`), spread as `{...(isDisabled !== undefined && { isDisabled })}`.
- **Labels:** reuse `FieldLabel`, `FieldDescription` and `FieldError` from `../Field`. Pass `announceRequired` when the required state isn't otherwise announced (it isn't for groups or button-triggered pickers).
- **State styles** come from react-aria render props (`isHovered`, `isPressed`, `isFocusVisible`, `isDisabled`, …). Draw focus with `outlineColor: color.borderFocus`, `outlineWidth: focus.width` and `outlineOffset: focus.offset`.
- **Forced colours:** for anything drawn only with fills, add `forcedColorAdjust: "none"` plus a `[breakpoints.forcedColors]` value in system colours (`Canvas`, `CanvasText`, `Highlight`, `HighlightText`, `GrayText`).
- **Responsive:** use `size.control*` and `space.*` tokens; spacing already tightens on mobile. Use logical properties (`insetInlineStart`, `paddingInline`). Mirror any directional transform in RTL (`useLocale().direction`).
- **Motion:** use `motion.*` durations, which become 0ms under reduced motion. Don't add your own `prefers-reduced-motion` query.

Then export it from `packages/ui/src/index.ts`, keeping the alphabetical order, with the component and its `type` exports.

Before moving on, run `lint_styles` from the MCP server on the styles block, then `pnpm --filter @dsw/ui lint`.

## 7. Stories: `Name.stories.tsx`

- `title: "Components/Name"` (`"Layout/Name"` or `"Typography/Name"` for those families), `tags: ["autodocs"]`, `parameters: { layout: "centered" }`, and `fn()` for the event handlers.
- Include `Default`, one story per meaningful variant or state, `Disabled`, and a `Controlled` story with a small wrapper that holds `useState` and renders an `<output>` of the value.
- Inline `style={{...}}` is fine in stories only; the lint rule runs only inside `stylex.create`.

## 8. Tests: `Name.test.tsx` (Vitest + Testing Library, jsdom)

- Query by role and accessible name (`getByRole("switch", { name: "Wi-Fi" })`), never by class or test id.
- Cover:
  - **Behaviour:** the role and name, the keyboard path, controlled vs uncontrolled updates, and `onChange` payloads.
  - **Disabled:** disabled via its own prop **and** via an enclosing `<Fieldset isDisabled>`.
  - **Labels:** required or invalid announcements, when the component has them.
- jsdom can't check visuals or contrast; those are covered in step 10.

## 9. Workbench demo: `apps/workbench/src/pages/ComponentsPage.tsx`

Add a `<section>` with an `<h2>` showing its variants and states. This page is what E2E scans:

- `e2e/a11y.spec.ts` runs axe on it in all 6 themes.
  - **Overlays:** if the component opens an overlay (popover, dialog, menu), add a step there that opens it and scans again. Overlays render into `<body>` and are missed otherwise.
- Add an aria snapshot to `e2e/a11y-tree.spec.ts` for anything with group or required semantics.
- For components drawn only with fills, add a forced-colours pixel test to `e2e/forced-colors.spec.ts`, following the switch test.

## 10. Regenerate the manifest and verify everything

```bash
pnpm --filter @dsw/ui manifest
pnpm typecheck && pnpm lint && pnpm test
pnpm test:e2e
```

- Commit `packages/ui/generated/`. Check that `get_component({ name: "Name" })` from the MCP server shows the props, the token groups (`nameTokens`, `nameShape`), the contrast pairs and the story ids.
- Look at it in the workbench preview in Iris, Volt and Bloom, light and dark.
- Run `pnpm storybook` and confirm the stories render and their ids match the manifest (`components-name--default`).

## 11. Docs

- **ACCESSIBILITY.md:** if the component has a notable accessibility decision (a role choice, an announcement, a forced-colours treatment), record it. Update the audited pair count there if you added pairs.
- **ARCHITECTURE.md:** only if the component introduces a new pattern.

## Done when

- Every colour it paints is a `nameTokens` token, and every one of them appears in a contrast pair that passes in 6/6 themes.
- `pnpm test` passes, which proves the generated token export and manifest are up to date.
- `pnpm test:e2e` passes, and axe has scanned the component in every theme, including any overlay it opens.
- Stories include a controlled example, and tests cover disabled-by-fieldset.
