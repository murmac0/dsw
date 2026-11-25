import manifest from "@dsw/ui/generated/components.json";
import { Badge, Card, Grid, Inline, Link, Stack, Text } from "@dsw/ui";
import { DocSection, STORYBOOK } from "../docs";
import { href } from "../routes";

/**
 * Every public component, grouped by job. Names are checked against the
 * generated manifest (a missing one throws on load), and story counts
 * come from it.
 */
type Entry = { name: string; summary: string; page?: string };

const GROUPS: Array<{ label: string; entries: Entry[] }> = [
  {
    label: "Actions and navigation",
    entries: [
      { name: "Button", summary: "Triggers an action, in four variants and three sizes.", page: "/components/button" },
      { name: "Link", summary: "Navigates. Always underlined; marks external links." },
      { name: "Tabs", summary: "Switches between views of one page." },
    ],
  },
  {
    label: "Forms",
    entries: [
      { name: "TextField", summary: "A labelled input with description and error.", page: "/components/text-field" },
      { name: "Select", summary: "Choose one option from a list.", page: "/components/select" },
      { name: "Checkbox", summary: "A choice applied when the form is submitted.", page: "/components/selection-controls" },
      { name: "CheckboxGroup", summary: "Several related checkboxes with one value.", page: "/components/selection-controls" },
      { name: "Switch", summary: "A setting that takes effect immediately.", page: "/components/selection-controls" },
      { name: "RadioGroup", summary: "One of a few options, with arrow-key movement.", page: "/components/selection-controls" },
      { name: "Fieldset", summary: "Groups fields under one legend; disables them together.", page: "/components/fieldset" },
    ],
  },
  {
    label: "Overlays and feedback",
    entries: [
      { name: "Dialog", summary: "A modal that traps and restores focus.", page: "/components/dialog" },
      { name: "Alert", summary: "An inline message: info, success, warning or error." },
      { name: "Badge", summary: "A short status label." },
    ],
  },
  {
    label: "Layout and type",
    entries: [
      { name: "Container", summary: "Centres a page region at a readable width." },
      { name: "Stack", summary: "A column with a token gap." },
      { name: "Inline", summary: "A wrapping row with a token gap." },
      { name: "Grid", summary: "Card grids that collapse on narrow screens." },
      { name: "Card", summary: "A surface for a section, summary or grid item." },
      { name: "Heading", summary: "Headings, with level and size set separately." },
      { name: "Text", summary: "Body copy in the type scale and colour roles." },
      { name: "CodeBlock", summary: "Source code with highlighting and a copy button." },
    ],
  },
  {
    label: "Theming",
    entries: [
      { name: "ThemeProvider", summary: "Puts one brand and mode theme on the page.", page: "/get-started" },
    ],
  },
];

const byName = new Map(manifest.components.map((c) => [c.name, c]));

export const catalog = GROUPS.flatMap((g) =>
  g.entries.map((e) => {
    const entry = byName.get(e.name);
    if (!entry) throw new Error(`${e.name} isn't in the component manifest`);
    // Storybook's docs page for a component shares its stories' id prefix:
    // "components-link--default" → "components-link--docs".
    const storyId = entry.stories?.[0]?.id;
    return {
      ...e,
      stories: entry.stories?.length ?? 0,
      docs: storyId && `${STORYBOOK}?path=/docs/${storyId.split("--")[0]}--docs`,
    };
  }),
);

export function ComponentsIndexPage() {
  return (
    <Stack gap="xxl">
      {GROUPS.map((group) => {
        const id = `components-${group.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
        return (
          <DocSection key={group.label} id={id} title={group.label}>
            <Grid as="ul" columns={3} gap="md">
              {group.entries.map((e) => {
                const item = catalog.find((c) => c.name === e.name)!;
                return (
                  <Card
                    as="li"
                    key={e.name}
                    title={e.name}
                    titleLevel={3}
                    padding="md"
                    footer={
                      <Inline gap="md" justify="end">
                        {e.page && (
                          <Link href={href(e.page)}>
                            {e.page === "/get-started" ? "Set it up" : `${e.name} examples`}
                          </Link>
                        )}
                        {item.docs && (
                          <Link href={item.docs} isExternal>
                            {`${e.name} in Storybook`}
                          </Link>
                        )}
                      </Inline>
                    }
                  >
                    <Stack gap="sm" align="start">
                      <Text size="sm">{e.summary}</Text>
                      {item.stories > 0 && (
                        <Badge tone="neutral">{`${item.stories} stories`}</Badge>
                      )}
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </DocSection>
        );
      })}
    </Stack>
  );
}
