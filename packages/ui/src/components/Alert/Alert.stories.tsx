import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Button } from "../Button/Button";
import { Link } from "../Link/Link";
import { Stack } from "../Stack/Stack";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    tone: "info",
    title: "Scheduled maintenance",
    children: "The dashboard will be read-only on Sunday from 02:00 to 03:00 UTC.",
  },
  argTypes: { tone: { control: "inline-radio", options: ["info", "success", "warning", "danger"] } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap="md">
      <Alert tone="info" title="New: audit log">Every change is now recorded.</Alert>
      <Alert tone="success" title="Settings saved" />
      <Alert tone="warning" title="Trial ends in 3 days">
        Add a payment method to keep your projects. <Link href="#billing">Go to billing</Link>
      </Alert>
      <Alert tone="danger" title="Payment failed">Your card was declined.</Alert>
    </Stack>
  ),
};

export const Dismissible: Story = { args: { onDismiss: fn() } };

function AnnounceDemo() {
  const [saved, setSaved] = useState(false);
  return (
    <Stack gap="md" align="start">
      <Button onPress={() => setSaved(true)}>Save</Button>
      {saved && (
        <Alert tone="success" title="Settings saved" announce onDismiss={() => setSaved(false)} />
      )}
    </Stack>
  );
}

/** `announce` makes it a live region: screen readers read it out when it appears. */
export const Announced: Story = {
  parameters: { controls: { disable: true } },
  render: () => <AnnounceDemo />,
};
