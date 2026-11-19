import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../Card/Card";
import { Text } from "../Text/Text";
import { Grid } from "./Grid";

const cards = ["Projects", "Members", "Storage", "API calls", "Uptime", "Invoices"].map((t) => (
  <Card key={t} title={t} titleLevel={3} padding="md">
    <Text tone="muted" size="sm">Summary for {t.toLowerCase()}.</Text>
  </Card>
));

const meta = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["autodocs"],
  args: { children: cards },
  argTypes: {
    columns: { control: "inline-radio", options: ["auto", 1, 2, 3, 4] },
    gap: { control: "select", options: ["none", "xxs", "xs", "sm", "md", "lg", "xl", "xxl"] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As many 240px-minimum columns as fit. Resize the canvas. */
export const Auto: Story = {};
/** Three columns on desktop, two on tablet, one on phones. */
export const ThreeColumns: Story = { args: { columns: 3 } };
