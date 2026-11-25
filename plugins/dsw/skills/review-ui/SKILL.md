---
name: review-ui
description: Review UI code in an app that uses @dsw/ui for design-system compliance and accessibility. Covers DS components over native elements, tokens over hardcoded values, layout primitives, heading structure and announcements. Use when asked to review, audit or check frontend changes, a PR, a diff or specific files against the design system.
---

# Review UI against @dsw

## 1. Scope

Review the files the user names. Otherwise use the current diff
(`git diff` against the base branch), limited to `.tsx`/`.jsx` and style
files.

## 2. Mechanical checks (the same rules as CI)

- **Lint:** if the app's ESLint config includes `@dsw/eslint-plugin`, run ESLint on those files. Otherwise call the `dsw` MCP server's `lint_styles` (scope `"app"`) on each file.
- **Coverage:** together these catch:
  - hardcoded colours, sizes and durations, with the token to use instead
  - primitive-token imports
  - native `<button>`/`<a>`/`<h1>`/`<input>` where @dsw/ui has a component
  - direct React Aria imports
  - hand-written flex and grid layouts that should be `Stack`, `Inline` or `Grid`

## 3. Judgement checks (lint can't see these)

- **Heading outline:** one `h1`; levels follow the page structure without skipping, and aren't chosen for size.
- **Actions:** one primary Button per view. Destructive actions confirm in a `Dialog role="alertdialog"`. Links navigate; Buttons act.
- **Announcements:** messages that appear after an action use `Alert announce`. Alerts present on page load don't (they'd interrupt).
- **Names:** repeated controls ("Remove", "Edit") say which item they act on. Icon-only buttons have an `aria-label`.
- **Forms:** every field has a visible label; groups of related fields use `Fieldset`; personal data has `autoComplete`.
- **Colour:** no meaning carried by colour alone. Any new colour pairing passes `check_contrast` in all themes.
- **Gaps:** hand-built tooltips, tables, toasts or menus. Confirm with `suggest_component`, and flag them as design-system gaps rather than approving one-offs.

## 4. Report

Group findings by severity:
- **Must fix:** accessibility failures and lint errors.
- **Should fix:** design-system drift.
- **Consider:** suggestions.

Give `file:line` for each, say what's wrong and what to use instead, and name the WCAG criterion for accessibility issues. Say what you checked and found fine, not only problems. End by offering to apply the fixes.
