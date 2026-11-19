import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inline } from "../Inline/Inline";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Active", tone: "success" },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "accent", "success", "warning", "danger"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <Inline gap="sm">
      <Badge>Draft</Badge>
      <Badge tone="accent">Pro plan</Badge>
      <Badge tone="success">Active</Badge>
      <Badge tone="warning">Trial</Badge>
      <Badge tone="danger">Overdue</Badge>
    </Inline>
  ),
};
