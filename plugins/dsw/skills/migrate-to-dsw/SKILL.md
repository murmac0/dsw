---
name: migrate-to-dsw
description: Move existing app UI onto the @dsw design system. Converts native buttons, links, headings and inputs, hand-written layout styles and raw values to @dsw/ui components and tokens, using the dsw-migrate codemod and then finishing the cases it can't. Use when asked to migrate, adopt, convert or "move to the design system".
---

# Migrate UI to @dsw/ui

The codemod does the mechanical part. Your job is the decisions it
deliberately leaves: variants, labels, layout and custom styling.

## 1. Prepare

- **Tooling:** check `@dsw/ui` and `@dsw/eslint-plugin` are installed. If the plugin isn't, ask before adding it as a dev dependency; the `dsw-migrate` command comes with it.
- **Clean tree:** make sure the git working tree is clean, so the codemod's changes show as their own diff. If it isn't, ask the user how to proceed.
- **Scope:** agree a folder or set of screens. Migrating screen by screen keeps reviews small.

## 2. Run the codemod

```bash
npx dsw-migrate <folder> --dry-run   # what it would change, and what needs a person
npx dsw-migrate <folder>             # apply
```

It rewrites only conversions that keep behaviour identical, and adds the
@dsw/ui imports:
- `<button onClick={() => …}>` becomes `<Button onPress={() => …}>`.
- `disabled` becomes `isDisabled`.
- `<a target="_blank">` becomes `<Link isExternal>`.
- `<h2>` becomes `<Heading level={2}>`.

Show the user the diff summary.

## 3. Finish what needs a person

Work through the "need a person" list it prints. For each item, call
`suggest_component` / `get_component` as needed.

- **Button with `className` or `style`:** pick the variant by intent:
  - the main action is `primary`
  - alternatives are `secondary`
  - low emphasis is `ghost`
  - destructive is `danger`

  Delete the custom styles.
- **Handler that reads the event:** `onPress` gets a press event, not a DOM `MouseEvent`. Remove `preventDefault`/`stopPropagation` where React Aria makes them unnecessary; otherwise keep a native element and say why.
- **`<input>`:** use `TextField` with a visible `label`. Use the nearby label text, then remove the old `<label>`. Keep `type`, `name` and `autoComplete`.
- **Checkboxes and radios:** `Checkbox` / `CheckboxGroup`, or `RadioGroup` with `Radio` items.
- **Hand-written layout styles** (`prefer-layout-primitives`): replace the wrapper with `Stack`, `Inline` or `Grid`. Map its gap to the spacing scale with `find_token_for_value` (e.g. `16px` → `gap="lg"`).
- **Raw values that remain:** use the token `find_token_for_value` gives, passing the CSS property.
- **Direct React Aria imports:** swap to the @dsw/ui component. If none exists, keep it, add an `eslint-disable-next-line @dsw/no-react-aria-direct -- <reason>`, and list it as a gap.

## 4. Verify and report

1. **Lint and test:** run ESLint (with `@dsw/eslint-plugin`), typecheck and the app's tests.
2. **Visual check:** if the app runs locally, look at each migrated screen. Button variants and spacing are the usual visual changes.
3. **Report:** what was converted automatically, what you changed by hand and why, and the gaps left for the design-system team.
