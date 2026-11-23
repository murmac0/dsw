# Accessibility review

Target: **WCAG 2.2 Level AA**. Last reviewed 2026-11-19.

Scope:

- **Components:** every `@dsw/ui` component (Button, TextField, Select,
  Checkbox, CheckboxGroup, RadioGroup, Switch, Fieldset, Dialog).
- **Workbench:** the app's Components, Foundations and Playground pages.
- **Themes:** all three brands (Iris, Volt, Bloom) in light and dark.

## Method

| Check | How | Enforced in CI |
|---|---|---|
| Automated rules | axe-core 4.14, `wcag2a/aa`, `wcag21a/aa`, `wcag22aa` tags. Run on every page plus the open Select and open Dialog, in all 6 brand × mode combinations | `e2e/a11y.spec.ts` |
| Colour contrast | Every component colour pairing (text 4.5:1, non-text 3:1), measured from computed colours in all 6 combinations | `e2e/contrast.spec.ts` |
| Forced colours (Windows High Contrast) | Pixel comparison of each state (on/off, selected, focused), because computed styles don't reflect forced colours | `e2e/forced-colors.spec.ts` |
| Keyboard and focus | React Aria interaction patterns; focus trap, Escape and focus return for dialogs; roving focus in radio groups; one visible focus indicator on every tab stop (first 60 stops, all brands) | `e2e/components.spec.ts`, unit tests |
| Semantics | Labels, descriptions and errors linked to inputs; groups named by legend or label; controlled/uncontrolled state | Unit tests (`*.test.tsx`) |
| Reflow and zoom (1.4.10, 1.4.4) | No horizontal scroll or off-screen content at 320 CSS px (= 400% zoom) and 640 CSS px (= 200% zoom), every brand and page | `e2e/reflow.spec.ts` |
| Text spacing (1.4.12) | WCAG override values applied; no clipped controls or spilled button text, every brand | `e2e/reflow.spec.ts` |
| What screen readers receive | Accessibility-tree snapshots of the composed form, disabled fieldset, alert dialog, brand switcher and loading button: roles, names, states, no stray live regions | `e2e/a11y-tree.spec.ts` |
| Target size (2.5.8) | axe `target-size` rule. Touch devices also get 44px controls via tokens | `e2e/a11y.spec.ts`, `e2e/responsive.spec.ts` |
| Structure | One `<header>` and one `<main>`, no skipped heading levels, `lang="en"`, page title | Manual |

## Findings and fixes (this review)

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 1 | Switch track and thumb invisible in forced-colours mode; state lost | 1.4.11, 4.1.2 | Serious | Opt out with `forced-color-adjust: none`; redraw in `Canvas`/`CanvasText`/`Highlight` |
| 2 | Selected radio dot invisible in forced colours; every radio looked unselected | 1.4.11 | Serious | Dot painted in `CanvasText` under forced colours |
| 3 | Select menu keyboard focus invisible in forced colours (background only) | 2.4.7 | Serious | Inset outline under forced colours |
| 4 | Selected workbench tab and brand indistinguishable in forced colours | 1.4.11 | Moderate | `Highlight`/`HighlightText` under forced colours |
| 5 | Palette chip labels 4.3:1 on `mint600`, 4.4:1 on Bloom `stone` (found by axe) | 1.4.3 | Serious | Labels use pure black or white, which always clears 4.58:1 |
| 6 | Contrast audit was a visual table built from `div`s | 1.3.1 | Moderate | Real `<table>` with caption, column headers and row headers |
| 7 | `aria-label` on a generic `<span>` (audit badge), which isn't allowed and can be ignored | 4.1.2 | Minor | Visible "Pass"/"Fail" text instead |
| 8 | Personal-data demo fields lacked `autocomplete` | 1.3.5 | Moderate | `name`, `email`, `organization`, and scoped `shipping`/`billing` address tokens; documented on TextField |
| 9 | Tab bar hid a tab off-screen at 320px in a scroller with no visible scrollbar | 1.4.10 | Minor | Tabs wrap |
| 10 | Spinner doc said loading was announced via `aria-busy` (it isn't; that's stripped) | — | Docs | Comment corrected |
| 11 | "Required" never announced on a required Select (the trigger is a `<button>`) or CheckboxGroup (`aria-required` isn't allowed on `role="group"`); the asterisk is `aria-hidden` | 3.3.2, 4.1.2 | Serious | Visually hidden ", required" in the label, so it's in the accessible name |
| 12 | Every Button rendered an empty `role="status"` region, adding noise to every form and dialog | 4.1.3 (best practice) | Minor | Only buttons that pass `isLoading` render one |
| 13 | Each Fieldset ended in an empty `<p>` (its live region), a "blank" browse-mode stop | 1.3.1 (best practice) | Minor | Generic `<div>` |
| 14 | Brand descriptions used the ARIA 1.3 draft `aria-description` | 4.1.2 | Minor | `aria-describedby` with visually hidden text |
| 15 | Demo loading spinner ran indefinitely on the Components page | 2.2.2 | Moderate | Real interaction: loads for 3s, then stops. Spinners also slow to 1.8s per turn under reduced motion |

Earlier rounds also fixed:

- A Fieldset error region hidden with `display: none`, so its errors
  weren't announced.
- Checkboxes reading as radios in Bloom (shape is the cue).
- Dark-mode overlays not themed.
- Low-contrast text in several places: the dark danger button, gradient
  text, and the Volt invalid border.

## Page-building components: decisions

Layout, typography, Card, Link, Badge, Alert and Tabs were added to
compose whole pages. Each choice is tested in the E2E suite, and the
example settings page is scanned by axe in every brand and mode.

| Component | Decision | WCAG |
|---|---|---|
| Heading | `level` is required and separate from `size`, so a design can't pick a level for its looks | 1.3.1, 2.4.6 |
| Link | Always underlined, so links are found without colour. `isExternal` adds "(opens in a new tab)" to the accessible name and `rel="noopener noreferrer"` | 1.4.1, 3.2.5 |
| Alert | Tone carried three ways: colour, a different icon *shape*, and a visually hidden "Warning:" prefix (localisable). Not a live region by default; `announce` gives `role="status"` (info, success) or `role="alert"` (warning, danger) for messages that appear after an action | 1.4.1, 4.1.3 |
| Badge | Plain text, never a live region. Gets an outline under forced colours, where its wash disappears | 1.4.1, 1.4.11 |
| Tabs | React Aria keyboard model (arrows, Home/End, disabled tabs skipped). The selected bar is a border with `forced-color-adjust: none`, painted `Highlight` under forced colours. Tabs wrap instead of scrolling | 1.4.10, 1.4.11, 2.1.1 |
| Card | Not a landmark unless `as="section"` with a title, so a page of cards doesn't flood the landmark list. Form controls inside a card are contrast-checked against the card surface | 1.3.1, 1.4.11 |
| Stack / Inline / Grid | Rendering as `ul`/`ol` keeps list semantics (item counts announced) without bullets. Inline wraps by default and Grid collapses to one column on phones | 1.3.1, 1.4.10 |

Status colours (`fgWarning`, and success, warning and danger washes) were
added to the semantic layer in every theme, each carrying its text at
4.5:1. Volt's acid lime is ~1.1:1 on paper, so Volt's selected-tab bar is
ink, not lime.

## Results

- axe-core: **0 violations** at WCAG 2.2 A/AA, across all pages, open
  overlays, brands and modes.
- Contrast audit: **all 109 pairings pass** in all 6 combinations.
- Forced colours: switch, radio, tab and menu-focus states are painted.
  These tests were checked: they fail with the fixes disabled.
- Reflow and zoom: no horizontal scroll at 320px and 640px in any brand.
  Text spacing: nothing clips.
- Each new test was checked against the bug it guards:
  - Restoring the old tab scroller fails the 320px reflow test.
  - Dropping the "required" text fails the tree snapshot.
  - Disabling the forced-colour fixes fails 4 of the 5 forced-colour
    tests. The brand-switcher test passes even without its fix, because
    Chromium's own button rendering already shows the selection.

## Known limitations: needs a person

These can't be automated here. Use the manual script below before
claiming conformance.

- **Real screen readers.** Not yet listened to with VoiceOver (macOS/iOS),
  NVDA or JAWS (Windows), or TalkBack. The tree snapshots prove what they
  *receive*, not how each one *speaks* it.
- **Real Windows High Contrast.** Forced colours are *emulated* in
  Chromium. Check on Windows with at least one light and one dark
  contrast theme.
- **Voice control** (Voice Control, Dragon). Volt's uppercase button text
  differs from its accessible name in case only. That's fine for WCAG
  2.5.3, but worth confirming.
- **Required text spacing in Chrome:** the required group's name reads
  "Notify me by , required". Chrome adds a space before the comma
  because the hidden text sits out of flow. Screen readers read it
  naturally, but it's visible in some inspectors.

## Manual test script (≈30 minutes per screen reader)

Run on the Components page, in at least Iris light and Volt dark.

1. **Keyboard only.** Tab from the top to "Save changes":
   - Every stop shows a focus ring.
   - Arrow keys move within Plan (radios), the brand switcher and the
     Select menu.
   - Escape closes the Select menu and dialogs, and focus returns to
     the trigger.
2. **Fieldsets.** With VoiceOver (Ctrl+Option+→) or NVDA (Tab), move
   into "Billing address":
   - Expect the group name ("Billing address") before "Street, edit
     text".
   - Untick "same as shipping" and confirm the fields are announced as
     enabled.
3. **Required.** In "Workspace settings", reach "Notify me by". Expect
   "Notify me by, required" and a group announcement. On "Region", the
   name and value are read.
4. **Errors.** Clear "Billing email", type "nope" and press Save:
   - Focus should move to the field.
   - Expect "invalid" plus "Enter a valid email address".
   - Untick Email in "Notify me by", save again, and expect "Choose at
     least one channel".
5. **Loading.** Press "Save draft". Expect "Loading" to be announced once,
   with focus staying on the button and no "Save draft Loading".
6. **Dialogs.** Open "Delete workspace":
   - Expect "alert dialog, Delete workspace?", then the body text.
   - Tab cycles inside the dialog.
   - Escape closes it and focus returns to "Delete workspace".
7. **Windows High Contrast** (Settings → Accessibility → Contrast themes):
   - Switches show their state.
   - The selected radio shows a dot.
   - The selected tab and brand are highlighted.
   - The focused Select option is outlined.
   - Every focus ring is visible.
8. **Zoom.** At 200% and 400% browser zoom, nothing needs horizontal
   scrolling and nothing overlaps.

## Keeping it this way

New components must:

- Add their colour pairings to `@dsw/tokens/contrast`.
- Pass the axe scan.
- Handle forced colours for any state shown only by a fill.
- Have tests for label, description and error association.

The lint rule `@dsw/no-raw-style-values` keeps colours on audited tokens.
