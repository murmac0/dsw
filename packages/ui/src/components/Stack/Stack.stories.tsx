import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Stack } from "./Stack";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  args: {
    gap: "md",
    children: (
      <>
        <Text>First item</Text>
        <Text>Second item</Text>
        <Text>Third item</Text>
      </>
    ),
  },
  argTypes: {
    gap: { control: "select", options: ["none", "xxs", "xs", "sm", "md", "lg", "xl", "xxl"] },
    align: { control: "inline-radio", options: ["stretch", "start", "center", "end"] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loose: Story = { args: { gap: "xl" } };

/** `align="start"` stops children stretching to the full width. */
export const AlignStart: Story = {
  args: {
    align: "start",
    children: (
      <>
        <Badge tone="accent">Beta</Badge>
        <Button variant="secondary">Shrink-wrapped</Button>
      </>
    ),
  },
};

/** `as="ul"` keeps list semantics without bullets; children are `<li>`. */
export const AsList: Story = {
  args: {
    as: "ul",
    gap: "sm",
    children: (
      <>
        <li><Text as="span">Ada Lovelace</Text></li>
        <li><Text as="span">Grace Hopper</Text></li>
      </>
    ),
  },
};
