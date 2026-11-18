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
CSS, and its `defineVars`/`createTheme` pair maps directly onto a two-tier
token system (see below) — themes are typed objects, not string overrides.

**Rules the compiler enforces that aren't obvious from the docs alone:**

- A file that exports `stylex.defineVars()` / `defineConsts()` / `defineMarker()`
  output must be named `*.stylex.ts`, and **only** those three may be
  exported from such a file (enforced by `@stylexjs/eslint-plugin`'s
  `enforce-extension` rule). `createTheme()` output must NOT live in a
  `.stylex.ts` file — it goes in a plain `.ts` file instead.
- `defineVars()`/`createTheme()` values are resolved by *static AST
  analysis*, not runtime evaluation. A plain exported object's properties
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
  supports per-call style *functions* — `styles.swatchFill(hexValue)` — which
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

- **Bricolage Grotesque** (`fontFamily.display`): headings, with an
  optical-size axis.
- **Geist** (`fontFamily.sans`): UI text.
- **Geist Mono** (`fontFamily.mono`): code.

They're self-hosted rather than loaded from a font CDN: no third-party
request, works offline, and versions are pinned. Display sizes
(`display1–3`) pair with `letterSpacing.tight`.

### Needs a human design review

These choices were made to a staff-level bar and verified for contrast,
but haven't been signed off by a design lead. Worth a review:

- The hue choices.
- Neutral tint strength. `ink50` canvas is noticeably lavender.
- Dark surface steps.
- Radius scale (6/10/16/22).
- The Bricolage + Geist pairing at small display sizes.

### Token groups

| Group | Examples | Notes |
|---|---|---|
| `color` | `bgSurface`, `fgDanger`, `borderFocus`, `fgGradientStart` | Overridden per theme |
| `brand` | `iris`, `coral`, `mint`, `amber` | Decorative only, never text |
| component groups | `buttonTokens`, `fieldTokens`, `selectionTokens`, `switchTokens`, `menuTokens`, `dialogTokens` | Alias semantic; themed where needed |
| `space` | `xxs`…`xxl`, `gutter` | 4px scale; `gutter` is responsive |
| `size` | `controlSm/Md/Lg`, `indicator`, `dialogMd`, `contentMax` | Control sizes grow on touch |
| `radius` | `sm`…`full` | |
| `borderWidth`, `focus` | `thin`, `thick`; `focus.width/offset` | One focus ring everywhere |
| `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFamily` | `display1`, `semibold`, `tight`, `display` | |
| `motion` | `fast/medium/slow`, `easeOut`, `emphasized` | 0ms under reduced motion |
| `opacity`, `zIndex`, `shadow` | `pressed`, `overlay`, `dialog` | |
| `breakpoints` (consts) | `mobile`, `tablet`, `coarsePointer` | Media queries can't be CSS vars |

**Responsive behaviour lives in tokens where it can.** `defineVars()` values
can be conditional on a media query, so `size.controlMd` is 40px with a
mouse and 44px on touch screens, `space.gutter` tightens on phones, and every
`motion` duration becomes 0ms under `prefers-reduced-motion`. Components get
touch targets and reduced motion for free, with no component-level
media queries. Layout changes that tokens can't express (Dialog docking to
the bottom of the screen on phones, stacked footer actions) use the
`breakpoints` constants as StyleX condition keys.

**Enforced, not just encouraged.** `dsw/no-raw-style-values`
(`packages/eslint-config/no-raw-style-values.js`) fails lint on raw lengths,
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

## What's deliberately not here yet

- No design-token build pipeline (e.g. Style Dictionary) — the token files
  themselves are already the single source of truth; automating export to
  other platforms is a real Phase 2, not scope creep to bolt on now.
- No visual regression testing (Chromatic/Percy) — flagged as a Phase 2
  addition, not needed to prove the component architecture.
- No router in the workbench app — three sections switched by local state
  via React Aria's `Tabs` is simpler than adding a routing dependency for
  three screens, at the cost of no deep-linkable URLs per section.
