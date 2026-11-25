# Architecture decisions

This document records the non-obvious decisions behind this repo's structure,
why they were made, and the trade-offs accepted. It is written for whoever
(including future-me) picks this project back up.

## Monorepo shape

```
apps/workbench        interactive docs site + playground (consumer-facing)
packages/ui            accessible React components
packages/tokens         design tokens + themes (no React dependency)
packages/eslint-config  shared flat ESLint config
```

Dependency direction is strictly `tokens → ui → workbench`. `tokens` has zero
React dependency so it could theoretically be consumed by a non-React
renderer later. `ui` depends only on `tokens`, never on `workbench`.
`eslint-config` is a leaf every package depends on.

`ui` and `tokens` export their TypeScript **source** directly
(`"main": "./src/index.ts"`), not a built `dist/`. Vite/Vitest transpile
workspace packages on the fly, so there is no build step to keep in sync
during development, and no stale-dist class of bugs. The trade-off: these
packages aren't set up to be published to npm as-is — that would need an
actual build (e.g. `tsup`) added when/if that's ever needed. Out of scope for
a workbench whose only consumer is itself.

## Styling: StyleX

Chosen over Vanilla Extract (which the author uses at work — deliberately
picking something else for this portfolio piece, discussed with the author
rather than assumed) and over Tailwind. StyleX is the zero-runtime,
RSC-compatible successor pattern to styled-components-style CSS-in-JS
(see Linear's 2026 migration write-up), compiles to atomic, collision-free
CSS, and its `defineVars`/`createTheme` pair maps directly onto a tiered
token system (see below) — themes are typed objects, not string overrides.

**Rules the compiler enforces that aren't obvious from the docs alone:**

- A file that exports `stylex.defineVars()` / `defineConsts()` / `defineMarker()`
  output must be named `*.stylex.ts`, and **only** those three may be
  exported from such a file (enforced by `@stylexjs/eslint-plugin`'s
  `enforce-extension` rule). `createTheme()` output must NOT live in a
  `.stylex.ts` file — it goes in a plain `.ts` file instead.
- `defineVars()`/`createTheme()` values are resolved by _static AST
  analysis_, not runtime evaluation. A plain exported object's properties
  (`primitives.white`) are invisible to the compiler across a file/package
  boundary — hence `packages/tokens/src/primitives.stylex.ts` uses
  `stylex.defineConsts()` for primitives, StyleX's purpose-built construct
  for compiler-visible constants, rather than plain objects.
- Re-exporting `defineVars()`-derived tokens through a barrel `index.ts`
  breaks the compiler's ability to trace them back to their origin file.
  `packages/tokens`'s `index.ts` only exports plain types; components import
  tokens directly from `@dsw/tokens/semantic.stylex` and
  `@dsw/tokens/themes/dark` (wired up as package `exports` subpaths).
- Mixing a raw `style` prop with `{...stylex.props(...)}` is a lint error
  (`no-conflicting-props`). For values that are only known at render time
  (e.g. iterating over a token list to render swatches), `stylex.create()`
  supports per-call style _functions_ — `styles.swatchFill(hexValue)` — which
  stay inside StyleX's compiled system instead of falling back to inline
  styles.

**Known rough edge accepted as a trade-off of picking a newer library:**
the Vite plugin (`@stylexjs/unplugin`, via its internal lightningcss native
binding) doesn't tear down cleanly after a one-shot `vitest run`, adding a
harmless ~10s delay at the end of every test run. Tests still pass and exit
correctly; this is cosmetic.

## Tokens: three tiers (primitive → semantic → component)

`primitives.stylex.ts` holds raw scales (colour ramps, spacing, radii, font
sizes) with no theme awareness. `semantic.stylex.ts` names roles
(`color.bgSurface`, `color.fgMuted`, `color.borderFocus`, …) with the light
theme as `defineVars()`'s defaults. `components.stylex.ts` gives every
component its own group (`buttonTokens.primaryBg`, `fieldTokens.border`,
`switchTokens.thumb`, …) whose defaults alias semantic tokens.
`themes/dark.ts` overrides semantic tokens via `createTheme()`, and
overrides a component token only where the alias isn't right for that
component.

Components consume only their component tokens, plus the shared focus
ring. That's what makes theming additive at two levels: a new theme or
brand is one more file of `createTheme()` calls, and a brand can restyle one
component (pill-shaped secondary buttons, say) without touching what every
other component shares.

**Why aliases follow the theme.** A component token compiles to
`--button-primary-bg: var(--accent)` declared at `:root`. Custom properties
resolve where they're declared, so the theme class must sit on the same
element, `<html>` (see "Themes live on `<html>`" below). A theme applied to a
nested element would re-skin semantic tokens but not the aliases above it.
Nested theming (a dark panel on a light page) would need component themes
re-declared on that element. That's a known limitation, not used today.

### Colour

Ramps are generated in **OKLCH**, which has perceptually uniform lightness.
The same step number has the same visual weight across hues, so `iris600`
and `rose600` both carry white text at ~5:1, and semantic mappings can be
chosen by rule. Hues:

- `iris` (primary): electric violet.
- `ink` (neutrals): tinted toward violet, so greys belong to the palette.
- `coral`, `mint`, `amber`: warmth, success and warning.
- `rose`: danger.

Dark mode uses lighter accent fills with dark text (`iris400` + `ink975`,
8:1) rather than white on a mid tone, which can't reach 4.5:1 without going
muddy.

`brand.*` tokens are decorative only (logo, illustrations). Gradient text
uses `fgGradientStart` / `fgGradientEnd`, whose ends are both contrast-
audited.

### Contrast is tested, not asserted

`@dsw/tokens/contrast` lists every colour pairing the system ships, at the
component-token level (~60 pairs: labels on fills, borders against
surfaces, switch thumbs against both track states, and so on). Each pair is
tagged `text` (4.5:1, WCAG 1.4.3) or `ui` (3:1, WCAG 1.4.11). Disabled
states are exempt under WCAG and not listed.

The Foundations page resolves each pair through a probe element, so it
measures what the browser actually paints after aliasing and theme
overrides, and shows a live table that re-measures on theme switch.
`e2e/contrast.spec.ts` runs it in both themes and fails on any miss or on
any token that doesn't resolve. Adding a component means adding its pairs.
I checked the guard fails for the right reason: breaking one dark token
fails eight named component pairs.

Rule this encodes: form controls are specified for `bgCanvas` and
`bgSurface`. `bgSurfaceRaised` is for chrome, not a backdrop for inputs.

### Typography

Self-hosted variable fonts via Fontsource (`import "@dsw/tokens/fonts"`):

- **Geist** (`fontFamily.display` and `fontFamily.sans`): headings and
  UI text. One family keeps Iris quiet and technical; headings get their
  character from weight and `letterSpacing.tight`, not a second face.
- **Geist Mono** (`fontFamily.mono`): code.

They're self-hosted rather than loaded from a font CDN: no third-party
request, works offline, and versions are pinned. Display sizes
(`display1–3`) pair with `letterSpacing.tight`.

### Brands

Three brands ship, each in light and dark, from `@dsw/tokens/themes`:

| Brand              | Character                                                                                                     | Type                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Iris** (default) | Electric violet, soft geometry                                                                                | Geist / Geist                  |
| **Volt**           | Neo-brutalist: square, 2px ink outlines, hard offset shadows, uppercase mono buttons that press into the page | Space Grotesk / JetBrains Mono |
| **Bloom**          | Editorial: cream and forest, pill buttons, generous curves, warm diffuse shadows                              | Fraunces / Instrument Sans     |

A brand is more than a colour swap. That's why component tokens come in
two kinds:

- `*Tokens`: colour, varies per mode.
- `*Shape`: radius, border weight, font, weight, letter case, shadow and
  press motion, varies per brand.

`buttonShape.pressTransform` is how Volt's buttons slide into their own
shadow while Iris's scale down slightly.

**Composition rule.** Exactly one `themes[brand][mode]` list goes on
`<html>`. Two `createTheme()` overrides of the same token group on one
element have no defined winner (it depends on stylesheet order), so each
list is complete for its combination. A brand's light and dark lists share
the same shape and type themes and differ only in colour and shadow.

**Most brand overrides reference semantic tokens, not hex values.** For
example, Volt's `buttonTokens.primaryBorder` is `color.borderStrong`, so
one override works in both modes. Only `color`, `brand` and `shadow` are
written out per mode.

**Pale fills get outlines, and the audit checks the outline.** Volt's lime
is ~1.1:1 on white, so it can't be a boundary. Checked boxes and switch
tracks carry an ink outline (`checkedBorder`, `trackOnEdge`, drawn via
`switchShape.edgeWidth`), and the contrast audit checks those edges, which
are the boundary users actually see. Where a brand draws no outline, the
edge tokens must equal the fill. Switch thumbs have separate off and on
colours (`thumb` / `thumbOn`), because no single colour clears 3:1 against
both a lime track and a near-black one.

**Verified:**

- The E2E contrast audit runs all six brand × mode combinations.
- `e2e/brands.spec.ts` asserts the brands really reshape components
  (radius, border, case, font, shadow), including portaled dialogs.
- The brand choice persists across reloads.

The workbench header has a brand switcher, and Storybook has Brand and Mode
toolbar pickers.

**Adding a brand:**

1. Add a palette to `primitives.stylex.ts`.
2. Add `themes/<brand>.ts` with `color`/`brand`/`shadow` per mode, plus
   whichever shape and component themes it changes.
3. Register it in `themes/index.ts`.
4. Add it to the brand list in `e2e/contrast.spec.ts`.

### Needs a human design review

These choices were made to a staff-level bar and verified for contrast,
but haven't been signed off by a design lead. Worth a review:

- The hue choices, and the Volt and Bloom brand concepts.
- Neutral tint strength. `ink50` canvas is noticeably lavender.
- Dark surface steps.
- Radius scale (6/10/16/22).
- Geist for Iris's headings (it replaced Bricolage Grotesque, which read
  as quirky next to technical docs).

### Token groups

| Group                                                                 | Examples                                                                                       | Notes                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| `color`                                                               | `bgSurface`, `fgDanger`, `borderFocus`, `fgGradientStart`                                      | Overridden per theme                |
| `brand`                                                               | `iris`, `coral`, `mint`, `amber`                                                               | Decorative only, never text         |
| component groups                                                      | `buttonTokens`, `fieldTokens`, `selectionTokens`, `switchTokens`, `menuTokens`, `dialogTokens` | Alias semantic; themed where needed |
| `space`                                                               | `xxs`…`xxl`, `gutter`                                                                          | 4px scale; `gutter` is responsive   |
| `size`                                                                | `controlSm/Md/Lg`, `indicator`, `dialogMd`, `contentMax`                                       | Control sizes grow on touch         |
| `radius`                                                              | `sm`…`full`                                                                                    |                                     |
| `borderWidth`, `focus`                                                | `thin`, `thick`; `focus.width/offset`                                                          | One focus ring everywhere           |
| `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFamily` | `display1`, `semibold`, `tight`, `display`                                                     |                                     |
| `motion`                                                              | `fast/medium/slow`, `easeOut`, `emphasized`                                                    | 0ms under reduced motion            |
| `opacity`, `zIndex`, `shadow`                                         | `pressed`, `overlay`, `dialog`                                                                 |                                     |
| `breakpoints` (consts)                                                | `mobile`, `tablet`, `reducedMotion`, `forcedColors`                                            | Media queries can't be CSS vars     |

**Responsive behaviour lives in tokens where it can.** `defineVars()` values
can be conditional on a media query, so `space.gutter` tightens on phones
and every `motion` duration becomes 0ms under `prefers-reduced-motion`.
Components get reduced motion for free, with no component-level media
queries. Control sizes are the same on every device: the smallest is 32px,
above WCAG 2.5.8's 24px minimum. Layout changes that tokens can't express (Dialog docking to
the bottom of the screen on phones, stacked footer actions) use the
`breakpoints` constants as StyleX condition keys.

**Enforced, not just encouraged.** `@dsw/no-raw-style-values`
(`packages/eslint-plugin/rules/no-raw-style-values.js`) fails lint on raw lengths,
durations, colours, and numeric weights / line heights / z-indexes /
opacities inside `stylex.create()` and `stylex.keyframes()`. Percentages,
full-viewport units, `0` and keywords pass, since they're layout mechanics.
A genuine one-off takes `// token-exempt: <reason>` on the same line or the
line above. There are six in the codebase (the visually-hidden technique,
spinner drawing, keyframe offsets, a press micro-interaction), so
`grep token-exempt` is the full list of exceptions.

## Component pattern: React Aria Components + StyleX

`Button` wraps `react-aria-components`'s `Button` rather than a bare
`<button>`, so interaction state (hover/press/focus-visible, unified across
mouse/touch/keyboard) comes from a maintained accessibility primitive instead
of being hand-rolled. StyleX classes are computed from React Aria's render
props (`isHovered`, `isPressed`, `isFocusVisible`) rather than CSS
pseudo-classes, because React Aria's hover/press state is already normalized
across input modalities — redundantly also keying off `:hover` would fight
that normalization on touch devices.

### The loading-state accessibility detail

`isLoading` deliberately does **not** set React Aria's `isDisabled` — that
would apply the native `disabled` attribute and remove the button from the
tab order, which loses the user's focus position exactly when they need
feedback that their action is in flight. Instead:

- `aria-disabled="true"` is set directly (React Aria's `useButton`
  explicitly forwards this one through; it's one of the few non-generic ARIA
  attributes it special-cases for exactly this kind of use).
- The press handler itself no-ops while loading, so Enter/Space/click can't
  re-trigger the action.
- **`aria-busy` does not reach the DOM** — `react-aria-components`'s
  `filterDOMProps` only forwards a small curated allowlist of ARIA
  attributes plus whatever the specific hook explicitly passes through, and
  `aria-busy` isn't one of them. Rather than fight the library, the loading
  announcement is a persistent visually-hidden `role="status"`/
  `aria-live="polite"` **sibling** of the button (not a child — nested text,
  even visually hidden via the clip technique, still feeds the button's
  accessible-name computation, which would turn "Save" into "Save Loading").

This is covered by both the Vitest/RTL unit test and the Playwright E2E test
for `Button`, from two different angles: RTL asserts the DOM contract
directly; Playwright's own actionability checks (it refuses to `.click()` an
`aria-disabled` element, and its `toBeDisabled()` matcher treats
`aria-disabled` as disabled) independently confirm real browser automation
tooling reads the semantics the same way.

### Shared field anatomy

Every labelled control (`TextField`, `Select`, `RadioGroup`) is built from
the same `Field` pieces — `FieldLabel`, `FieldDescription`, `FieldError` —
and the same `fieldStyles`, so label/description/error wiring
(`aria-labelledby`, `aria-describedby`, `aria-invalid`) and visual rhythm
are defined once. A visible `label` is required by the type: placeholder-as-
label isn't supported. The required asterisk is `aria-hidden`; the input's
own `required` carries the semantics.

Validation defaults to React Aria's `"native"` behaviour (browser
constraint validation, errors shown on submit through `FieldError`).
Don't mix that with hand-managed `isInvalid` state in the same form —
the browser blocks submit before your handler runs.

`Checkbox` and `Radio` share `selectionStyles`; `Switch` is kept separate
and documented as "applies immediately", since `role="switch"` announces
on/off rather than checked.

### Grouping: Fieldset and CheckboxGroup

There's deliberately **no generic `FormField` wrapper.** Every control
wires its own label, description and error through React Aria, and tests
prove it. A wrapper around arbitrary children can't guarantee that wiring,
and fails silently when it doesn't hold. New input types become dedicated
components on the shared `Field` pieces instead.

**`Fieldset`** groups _different_ controls under one announced legend
(WCAG 1.3.1): shipping vs billing "Street", or the sections of a long form.

- It's a native `<fieldset>`/`<legend>`, the most reliably announced
  grouping pattern.
- The description, and the group error while `isInvalid`, are linked via
  `aria-describedby`.
- The error sits in a polite live region that's always rendered (empty
  when valid, never `display: none`), so an error that appears after
  submit is announced.
- `isDisabled` sets native `disabled` _and_ flows through
  `FieldsetContext`. Native disabling makes inputs inert but React Aria
  doesn't know, so without the context the controls would still look
  enabled.
- `useInheritedDisabled` ORs the two, so a disabled fieldset always wins,
  matching what the browser does.
- Nested fieldsets inherit too.
- Variants: `plain` (a titled section) and `boxed` (a panel). Brands
  restyle it through `fieldsetShape`: Volt gets a hard shadow, Bloom soft
  curves.

**`CheckboxGroup`** is RadioGroup's sibling for multi-select. It has the
same field pieces and layout (`optionGroupStyles`), one `string[]` value,
and a group error. `isRequired` means "at least one": React Aria marks
the checkboxes required only while none is selected, so native validation
blocks submit and clears as soon as one is ticked. That's tested in a real
browser.

Radio and checkbox options group themselves. Use `Fieldset` around mixed
controls, not around a single RadioGroup or CheckboxGroup.

### Controlled and uncontrolled

Every stateful component supports both, following React's convention and
React Aria's prop names: `value`/`defaultValue` (TextField, Select,
RadioGroup), `isSelected`/`defaultSelected` (Checkbox, Switch),
`isOpen`/`defaultOpen` (Dialog, and Select's popover), each paired with an
`onChange`/`onOpenChange`. The wrappers pass these straight through rather
than adding their own state, so there's one state model, not two. Each
component has a `*.modes.test.tsx` proving the controlled contract: a
user interaction calls `onChange` but the UI doesn't move until the parent
re-renders with the new value.

### Themes live on `<html>`, not a wrapper

`Dialog` and `Select`'s popover are portaled to `document.body` by React
Aria. A theme class on a wrapper `<div>` never reaches them, so the
workbench's `ThemeProvider` applies the `createTheme()` class to
`document.documentElement`. Covered by an E2E test that opens a dialog in
dark mode and checks its surface colour.

## Environment pins (and why)

- **Node ≥ 22**, pinned to **24.22.2** via `.nvmrc`. The actual floor is
  "a Node that supports synchronous `require(esm)`" — jsdom's dependency
  chain (`html-encoding-sniffer` → `@exodus/bytes`) ships ESM-only files, and
  Node 20 can't `require()` those at all, which breaks `vitest run`
  entirely. This has nothing to do with our own code; it's purely a
  transitive-dependency constraint from the test environment.
- **Playwright pinned to `1.56.0`**, not latest. Playwright dropped macOS 13
  (Ventura) support in later releases on this architecture
  (`ERROR: Playwright does not support chromium on mac13-arm64`). 1.56.0 was
  the newest version confirmed (by actually launching a browser, not just
  installing it) to work on this machine. Bump this once the dev machine is
  on a newer macOS, or once installing on an older OS stops mattering.
- **TypeScript pinned to the 5.x line**, not the new TS 7 native/Go compiler.
  `typescript-eslint` doesn't support TS 7 yet (`<6.1.0` peer range) — using
  it would break linting across the whole repo for a compiler speed-up this
  project doesn't need yet.
- **ESLint pinned to 9.x**, not 10. `eslint-plugin-jsx-a11y` didn't support
  ESLint 10 at the time of setup.
- `pnpm-workspace.yaml`'s `allowBuilds: { esbuild: true }` and
  `minimumReleaseAgeExclude` entries are pnpm's supply-chain-security
  defaults (blocking postinstall scripts, and packages below a minimum
  release age, respectively) being explicitly opted back in for packages
  this project's own tooling needs. Not a blanket bypass — only the specific
  packages listed.

## Machine-readable system: token export and MCP server

The token sources stay the single source of truth. Everything else is
generated from them and checked against them.

**Token export (`pnpm --filter @dsw/tokens export`).** `defineVars()` throws
outside the StyleX compiler, so the tokens can't simply be imported by a
Node tool. `scripts/export-tokens.ts` reads them the way the compiler does:
TypeScript AST, constant folding and alias resolution. It applies each
`themes[brand][mode]` list with the same rules as the runtime (one
override per group per theme, or it fails). It writes:

- `generated/tokens.json`: every token with its value in all 6 themes,
  alias, media-query variants and description, plus the contrast audit
  with ratios per theme.
- `generated/dtcg/<brand>-<mode>.tokens.json`: W3C Design Tokens (DTCG)
  files for Figma / Tokens Studio. These carry structured colour and
  dimension values, with the token's JS reference and import path in
  `$extensions`.

Static analysis can drift from what the compiler emits, so
`e2e/token-export.spec.ts` checks all 208 tokens × 6 themes against the
browser's computed custom properties. It loads the app with `?token-probe`,
which lazy-loads a fixture that never enters the app bundle. Values are
compared through the browser's CSS parser, because StyleX minifies
(`120ms` → `.12s`).

**Component manifest (`pnpm --filter @dsw/ui manifest`).** It's built
from the TypeScript checker:

- Props with readable types: literal unions spelled out, own annotations
  kept.
- Inherited React Aria props filtered to the common ones.
- Doc comments, the token groups each component imports, and its stories.

Story ids follow Storybook's own rules: the title is only lowercased, while
export names are split into words. They're verified against its
`index.json`. Both generators have `--check` modes, wired into each
package's `test`, so a stale export fails CI.

**MCP server (`packages/mcp`).** This gives coding agents the system:
component reference, token search, value → token mapping, contrast checks,
guidelines, `suggest_component` (product words like "modal" or "pill"
→ components, and an honest "not yet" for gaps), and `lint_styles`,
which runs `@dsw/eslint-plugin` with token suggestions. In this repo it
runs from source on Node's TypeScript stripping; `.mcp.json` registers it
alongside Storybook's own MCP server, which handles story previews.
Tests drive it through a real MCP client, including the stdio entry
point.

## For app teams: lint rules, codemod, Claude Code plugin and packages

Product teams get the system through three channels that share one set
of rules:

- **`@dsw/eslint-plugin`.** `configs.recommended` for apps:
  - tokens only, and no primitive or barrel imports
  - `prefer-ds-components`: native `<button>`, `<a>`, `<h1>`, inputs and so on → @dsw/ui
  - `no-react-aria-direct`
  - `prefer-layout-primitives`: a hand-written flex or grid with a gap → Stack, Inline or Grid
  - `no-inline-style`

  `configs.library` is the token rules alone, for @dsw/ui itself, since it's built from native elements and React Aria.

- **`dsw-migrate` (in the plugin package).** A codemod built on `prefer-ds-components` in fix mode. It only rewrites conversions that keep behaviour identical, for example `onClick={() => …}` → `onPress`, `target="_blank"` → `isExternal`, and `<h2>` → `<Heading level={2}>`, and adds the imports. Anything that needs a decision (custom classes, handlers that read the DOM event, inputs needing labels) is listed with file and line instead. The fixes run through ESLint, so they're tested with RuleTester like any rule.
- **`plugins/dsw`, a Claude Code plugin.** It bundles the MCP server with `build-screen`, `review-ui` and `migrate-to-dsw` skills. Teams install it from this repo's marketplace (`.claude-plugin/marketplace.json`).
- **Publishing the server.** `@dsw/mcp` can't run from `.ts` source once installed, because Node won't strip types inside `node_modules`. `scripts/build.ts` bundles it with esbuild:
  - workspace code (the ESLint plugin, the colour maths) is inlined
  - the SDK, zod and ESLint stay as dependencies
  - the token, component and doc data is copied into `dist/data`, which the server reads when present

  `publishConfig` points `bin` at the build, so this repo keeps running source.

- **Publishing the components and tokens.** `@dsw/ui` and `@dsw/tokens` publish plain JavaScript and `.d.ts` built by `tsc -p tsconfig.build.json`, keeping the `.stylex` file names. They don't ship compiled CSS: StyleX's Vite plugin finds packages that depend on `@stylexjs/stylex` and compiles them with the app's own code. That's how StyleX libraries are meant to ship, because a `defineVars` hash must come from one compiler run for the whole app. As with the server, `publishConfig` points `exports` at `dist`, so the workspace keeps using source.
- **`ThemeProvider` lives in @dsw/ui.** Every app needs the brand × mode theme on `<html>`, and the code that puts it there uses `stylex.create`. Shipping it means app code doesn't need StyleX for theming. It supports controlled and uncontrolled use like any stateful component, and remembers the viewer's choice unless `persist={false}`.

## The starter and the consumer test

`templates/starter` is how an app team should start: Vite with the StyleX
plugin, `ThemeProvider`, the `recommended` lint rules, the Claude Code
plugin and a Playwright smoke test (styles load, themes apply, axe in all
six themes). It's a workspace package, so it's typechecked and linted
with everything else.

`pnpm test:consumer` (`tests/consumer/run.mts`, and a CI job) is the proof
that a release works for someone outside this repo:

1. builds and packs every `@dsw/*` package
2. copies the starter to a temp folder and installs it from the packs only
3. runs its typecheck, lint, build (checking the design system's CSS reached the bundle) and smoke test
4. talks to the packed MCP server over stdio
5. runs `dsw-migrate` on a legacy screen and checks what it rewrote and what it left
6. lints a screen that breaks every rule and checks each one is reported

The workspace can't catch these problems, because there everything
resolves to source through symlinks. Its first run found two: themes
needed about 100 lines of copied StyleX code (hence `ThemeProvider` in
@dsw/ui), and the starter's typecheck relied on `@types/node` from
elsewhere in the workspace.

The packages stay `private: true` until there's a registry to publish to.

## AI-ready: how agents use the system

Coding agents are now one of a design system's main consumers. They fail in
predictable ways: they invent components and props, hard-code values from
a mockup, and copy patterns from whatever docs they read, stale or not.
The system is built so that the right answer is the easy one to find and
the wrong one fails a check.

**What agents read is placed by how often it's loaded.** Agent context
comes in tiers, and the cost of a tier rises with how often it's loaded,
not with how much it holds:

| Tier        | Here                                                                    | Loaded                                     |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| Always      | `AGENTS.md`, `CLAUDE.md`                                                | every turn, so kept short                  |
| On demand   | skills (`add-component`, `build-screen`, `review-ui`, `migrate-to-dsw`) | only the description, until a task matches |
| Live        | the `dsw` MCP server                                                    | per question, from the generated data      |
| Handed over | `llms.txt`, `tokens.json`, DTCG, `components.json`                      | only when someone points an agent at them  |

**`AGENTS.md` is the source, and `CLAUDE.md` imports it.** Cursor, Copilot
and Codex read `AGENTS.md`; Claude Code reads only `CLAUDE.md`. So
`CLAUDE.md` starts with a bare `@AGENTS.md` line, which Claude Code expands
into context at launch. A markdown link there would be inert text, which
is a bug several large design systems ship. The two files also combine
differently: nested `AGENTS.md` files override their parents, while every
`CLAUDE.md` is concatenated, so this repo keeps one of each at the root.

**Instructions are tested like code.** An agent follows its instructions
faithfully, including a component name that was renamed last month, so a
stale doc becomes a build error in generated code. `packages/mcp/src/agent-files.ts`
reads every agent file and checks each component, prop, literal prop
value, token and MCP tool it names against the component manifest, the
token export and the server; `pnpm test` runs it.

**The website shows real output, not claims.** `packages/mcp/scripts/site-data.ts`
asks the real server real questions, measures the agent files and runs
the check above. The workbench's Overview and AI agents pages render that, and `pnpm test`
fails if it's out of date. The page also scores the system against an
outside checklist, gaps included: there's no Figma Code Connect yet, and
no benchmark of agent output with and without the MCP server. That
benchmark is the next step, because a machine interface is only worth
what it measurably changes, and no numbers are shown until they're measured.

**Accessibility that axe can't see.** Studies of generated UI find about
two accessibility problems per screen that pass axe: generic button
labels, vague link text, unlabelled repeats. axe runs in all 6 themes,
and the `review-ui` skill and the starter's `AGENTS.md` cover these by
instruction.

## Docs examples: the code shown is the code that runs

Each example on the docs site is one file under
`apps/workbench/src/examples`. The page imports it twice: normally, to
render the live demo, and with `?example`, which a small Vite plugin
(`vite-plugin-examples.ts`) turns into the file's source plus syntax
tokens. So the shown code can't drift from the demo, and because the
files are real code they're typechecked and held to the app lint preset.

- **Highlighting happens at build time** with Shiki, so pages ship no
  highlighter. Shiki colours tokens from a theme; ours gives each syntax
  role a placeholder colour that's read back as a role name
  (`keyword`, `string`, `comment`, `name`, `attribute`). `@dsw/ui`'s
  `CodeBlock` paints roles with `codeTokens`, which are contrast-checked
  in every theme like any other text, and takes tokens as a prop, so the
  library has no parser dependency.
- **Inline, not iframes,** for component demos: themes live on `<html>`,
  overlays portal to `<body>`, and axe scans the page as it is. The one
  exception is previewing a whole page at phone or tablet width:
  breakpoints follow the window, so only a frame of that width shows the
  real layout. `#/frame/<name>?brand=&mode=` renders a bare page with the
  theme from the URL, and the frame reloads when the theme changes.

## What's deliberately not here yet

- No visual regression testing (Chromatic/Percy) — flagged as a Phase 2
  addition, not needed to prove the component architecture.
- No router library in the workbench: a hash route per page (one
  `siteMap` list drives the sidebar, titles and routing) deep-links on
  GitHub Pages without server rewrites, and needs no dependency.
