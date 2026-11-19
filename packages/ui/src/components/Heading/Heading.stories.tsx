import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../Stack/Stack";
import { Heading } from "./Heading";

const meta = {
  title: "Typography/Heading",
  component: Heading,
  tags: ["autodocs"],
  args: { level: 2, children: "Workspace settings" },
  argTypes: {
    level: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    size: { control: "select", options: ["display1", "display2", "display3", "xxl", "xl", "lg", "md"] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Default size per level. Level is structure; size is look. */
export const Scale: Story = {
  render: () => (
    <Stack gap="md">
      <Heading level={1}>Heading 1 · display2</Heading>
      <Heading level={2}>Heading 2 · display3</Heading>
      <Heading level={3}>Heading 3 · xl</Heading>
      <Heading level={4}>Heading 4 · lg</Heading>
      <Heading level={5}>Heading 5 · md</Heading>
    </Stack>
  ),
};

/** A hero h1 at display1, and a small h2 for a dense panel. */
export const SizeOverride: Story = {
  render: () => (
    <Stack gap="md">
      <Heading level={1} size="display1">Ship faster</Heading>
      <Heading level={2} size="md">Recent activity</Heading>
    </Stack>
  ),
};
