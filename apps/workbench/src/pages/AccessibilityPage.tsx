import { Card, Grid, Link, Stack, Text } from "@dsw/ui";
import { ContrastAudit } from "./ContrastAudit";
import { DocSection, repoFile } from "../docs";

const BUILT_IN: Array<{ title: string; body: string }> = [
  {
    title: "Keyboard and focus",
    body: "Components are built on React Aria: dialogs trap focus and return it, radio groups use roving focus, and every tab stop shows the same focus ring.",
  },
  {
    title: "Names, states and errors",
    body: "Labels, descriptions and errors are linked to their inputs; groups are named by a legend; a loading button keeps its name and stays focusable.",
  },
  {
    title: "Forced colours",
    body: "Anything drawn only with fills (switch tracks, radio dots, the selected item) is repainted in system colours under Windows High Contrast.",
  },
  {
    title: "Motion and zoom",
    body: "Motion tokens drop to 0ms under reduced motion, so no component needs its own media query. Layouts reflow at 320px with no sideways scroll.",
  },
];

const TESTED: Array<{ check: string; how: string }> = [
  { check: "WCAG 2.2 AA rules", how: "axe on every page and open overlay, in all six themes." },
  { check: "Colour contrast", how: "Every pairing a component paints, measured from computed colours in all six themes." },
  { check: "Forced colours", how: "Pixel comparison of each state, because computed styles don't show forced colours." },
  { check: "Screen reader output", how: "Accessibility-tree snapshots: roles, names, states, no stray live regions." },
  { check: "Reflow and text spacing", how: "No sideways scroll at 320px and 640px; WCAG 1.4.12 spacing clips nothing." },
];

export function AccessibilityPage() {
  return (
    <Stack gap="xxl">
      <DocSection id="a11y-built-in" title="Built into the components">
        <Grid columns={2} gap="lg">
          {BUILT_IN.map((item) => (
            <Card key={item.title} title={item.title} titleLevel={3}>
              <Text size="sm">{item.body}</Text>
            </Card>
          ))}
        </Grid>
      </DocSection>

      <DocSection
        id="a11y-tested"
        title="Tested on every push"
        intro="Each test was checked against the bug it guards: with the fix undone, it fails."
      >
        <Card>
          <Stack as="ul" gap="md">
            {TESTED.map((t) => (
              <Stack as="li" gap="xxs" key={t.check}>
                <Text weight="semibold">{t.check}</Text>
                <Text size="sm" tone="muted">
                  {t.how}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>
      </DocSection>

      <DocSection
        id="a11y-contrast"
        title="Contrast audit"
        intro="Every colour pairing a component paints, resolved from the live theme. Switch brand or mode and it re-measures. The same check runs in CI."
      >
        <ContrastAudit />
      </DocSection>

      <DocSection
        id="a11y-person"
        title="What still needs a person"
        intro="Automated checks prove what assistive technology receives, not how it sounds."
      >
        <Text>
          Real screen readers, real Windows High Contrast and voice control are
          listed with a 30-minute manual test script in the{" "}
          <Link href={repoFile("ACCESSIBILITY.md")} isExternal>
            accessibility review
          </Link>
          .
        </Text>
      </DocSection>
    </Stack>
  );
}
