import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../Text/Text";
import { Link } from "./Link";

const meta = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: { href: "#billing", children: "Billing settings" },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Opens a new tab and says so, to screen readers as well. */
export const External: Story = {
  args: { href: "https://example.com/docs", isExternal: true, children: "Read the docs" },
};

/** Underlined inside text, so it's findable without relying on colour. */
export const InText: Story = {
  render: () => (
    <Text>
      You can change this later in <Link href="#billing">billing settings</Link> or{" "}
      <Link href="https://example.com/help" isExternal>contact support</Link>.
    </Text>
  ),
};
