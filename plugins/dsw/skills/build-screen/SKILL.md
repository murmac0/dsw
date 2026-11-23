---
name: build-screen
description: Build a page, screen, view or form with the @dsw design system (@dsw/ui components and @dsw/tokens). Use when asked to create, lay out or redesign UI (a settings page, a dashboard section, a sign-up form, an empty state) in an app that depends on @dsw/ui.
---

# Build a screen with @dsw/ui

The goal is a screen built only from design-system components. If you
need `stylex.create`, CSS or a raw colour, either a component or prop is
missing (say so) or you've missed one (ask the `dsw` MCP server).

The `dsw` MCP server answers every lookup below. Use it instead of
guessing prop names or values.

## 1. Outline before code

Write down, in a short list:
- **Purpose:** what the user comes here to do. That's the one primary action, so one `variant="primary"` Button per view.
- **Sections, in order, with heading levels.** One `h1` per page, sections `h2`, cards inside a section `h3`. Levels come from this outline, never from how big the text should look; `Heading` has a separate `size`.
- **Each piece of UI in plain words:** "status pill", "row of actions", "confirm before deleting".

## 2. Map pieces to components

For each piece, call `suggest_component` with the plain words, then
`get_component` for its props before using it.

- **Gaps:** if `suggest_component` says something isn't in @dsw/ui yet (tooltip, table, toast…), use the stand-in it gives and tell the user it's a gap for the design-system team. Don't build a one-off.
- **The usual mapping:**

| Need | Use |
|---|---|
| Page width and side padding | `Container` (outermost) |
| Vertical rhythm | `Stack gap="xl"` for sections, `"lg"` inside cards |
| A row: actions, title + badge | `Inline`; `justify="between" stackOnMobile` for title + actions |
| Tiles, plan cards | `Grid columns={3}` or `"auto"`; `as="ul"` with `Card as="li"` for a list |
| A settings section | `Card title description footer` |
| Titles and copy | `Heading level`, `Text tone size` |
| Status | `Badge tone` (a word or two); `Alert` for a message |
| Message after an action ("Saved") | `Alert announce` (screen readers hear it) |
| Destructive action | `Button variant="danger"` opening `Dialog role="alertdialog"` |
| Forms | `TextField`, `Select`, `Checkbox`/`CheckboxGroup`, `RadioGroup`, `Switch`; `Fieldset` to group |
| Navigation | `Link` (`isExternal` for new tabs); `Button` only for actions |
| Sub-views of one page | `Tabs` > `TabList aria-label` + `Tab id` and `TabPanel id` |

## 3. Compose

A typical page:

```tsx
<Container as="main">
  <Stack gap="xl">
    <Inline justify="between" stackOnMobile>
      <Heading level={1}>Billing</Heading>
      <Button>Upgrade</Button>
    </Inline>
    <Card title="Payment method" titleLevel={2} footer={<Button variant="secondary">Update card</Button>}>
      <Text tone="muted">Visa ending 4242</Text>
    </Card>
  </Stack>
</Container>
```

## 4. Accessibility, every time

- **Fields:** every one has a visible `label`. Personal data (name, email, address) gets `autoComplete`.
- **Repeated buttons:** say which item they act on (`aria-label={`Remove ${name}`}`).
- **Meaning:** never carried by colour alone. Status text says the status; Badge and Alert already pair colour with words and icons.
- **Custom colour pairs:** if you must add one, it passes `check_contrast` in every theme.

## 5. Verify

1. **Lint:** if the app's ESLint has `@dsw/eslint-plugin`, run it on the files you touched. Otherwise call `lint_styles` (scope `"app"`) on each one. Fix every finding.
2. **Typecheck,** and run the app's tests.
3. **Check every theme.** If the app can switch brand or mode, look at the screen in each: `list_brands` explains how themes are applied.
