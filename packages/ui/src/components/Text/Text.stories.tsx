import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../Stack/Stack";
import { Text } from "./Text";

const meta = {
  title: "Typography/Text",
  component: Text,
  tags: ["autodocs"],
  args: { children: "Changes apply to everyone in the workspace." },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    tone: { control: "select", options: ["default", "muted", "accent", "success", "warning", "danger"] },
    weight: { control: "inline-radio", options: ["regular", "medium", "semibold"] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Muted: Story = { args: { tone: "muted", size: "sm" } };

/** Every tone meets 4.5:1 on canvas and surface, in every theme. */
export const Tones: Story = {
  render: () => (
    <Stack gap="xs">
      <Text>Default: body copy</Text>
      <Text tone="muted">Muted: secondary information</Text>
      <Text tone="accent">Accent: highlighted</Text>
      <Text tone="success">Success: payment received</Text>
      <Text tone="warning">Warning: trial ends in 3 days</Text>
      <Text tone="danger">Danger: payment failed</Text>
    </Stack>
  ),
};

export const Mono: Story = { args: { mono: true, children: "ws_8f2k19xq" } };
