import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock, type CodeToken } from "./CodeBlock";

const code = `import { Button } from "@dsw/ui";

// One primary action per view.
<Button variant="secondary" onPress={save}>Save</Button>`;

/** What a build-time highlighter hands the component. */
const tokens: CodeToken[][] = [
  [
    { text: "import", kind: "keyword" },
    { text: " { " },
    { text: "Button", kind: "name" },
    { text: " } " },
    { text: "from", kind: "keyword" },
    { text: " " },
    { text: '"@dsw/ui"', kind: "string" },
    { text: ";" },
  ],
  [],
  [{ text: "// One primary action per view.", kind: "comment" }],
  [
    { text: "<" },
    { text: "Button", kind: "name" },
    { text: " " },
    { text: "variant", kind: "attribute" },
    { text: "=" },
    { text: '"secondary"', kind: "string" },
    { text: " " },
    { text: "onPress", kind: "attribute" },
    { text: "={save}>Save</" },
    { text: "Button", kind: "name" },
    { text: ">" },
  ],
];

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { code },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: "Example.tsx" } };

export const Highlighted: Story = { args: { title: "Example.tsx", tokens } };

export const WithoutTitle: Story = {};

export const NoCopyButton: Story = {
  args: { code: "npm install @dsw/ui", showCopy: false },
};

export const LongLinesWrap: Story = {
  args: {
    title: "long.ts",
    code: `export const message = "A line this long wraps onto the next one instead of scrolling sideways, so nothing is hidden on a phone or at 400% zoom.";`,
  },
};
