import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "../Heading/Heading";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";
import { Container } from "./Container";

const meta = {
  title: "Layout/Container",
  component: Container,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <Stack gap="sm">
        <Heading level={1}>Page title</Heading>
        <Text tone="muted">Content stays at a readable width, with side padding that tightens on phones.</Text>
      </Stack>
    ),
  },
  argTypes: { width: { control: "inline-radio", options: ["content", "form", "full"] } },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Content: Story = {};
export const Form: Story = { args: { width: "form" } };
