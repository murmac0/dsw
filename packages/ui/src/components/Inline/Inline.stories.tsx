import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Heading } from "../Heading/Heading";
import { Inline } from "./Inline";

const meta = {
  title: "Layout/Inline",
  component: Inline,
  tags: ["autodocs"],
  args: {
    children: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </>
    ),
  },
  argTypes: {
    gap: { control: "select", options: ["none", "xxs", "xs", "sm", "md", "lg", "xl", "xxl"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "baseline", "stretch"] },
    justify: { control: "inline-radio", options: ["start", "center", "end", "between"] },
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const End: Story = { args: { justify: "end" } };

/** A title with its actions: apart on wide screens, stacked on phones. */
export const TitleWithActions: Story = {
  args: {
    justify: "between",
    stackOnMobile: true,
    children: (
      <>
        <Inline gap="sm">
          <Heading level={2} size="xl">Members</Heading>
          <Badge>12</Badge>
        </Inline>
        <Button>Invite</Button>
      </>
    ),
  },
};
