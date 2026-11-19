import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Switch } from "../Switch/Switch";
import { Text } from "../Text/Text";
import { TextField } from "../TextField/TextField";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    title: "Workspace",
    description: "Shown to everyone you invite.",
    children: <TextField label="Workspace name" defaultValue="Acme" />,
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "danger"] },
    padding: { control: "inline-radio", options: ["md", "lg"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A settings section: fields in the body, Save in the footer. */
export const WithFooter: Story = {
  args: {
    title: "Notifications",
    description: "Choose what we email you about.",
    children: (
      <>
        <Switch defaultSelected>Weekly summary</Switch>
        <Switch>Product updates</Switch>
      </>
    ),
    footer: <Button onPress={fn()}>Save</Button>,
  },
};

export const WithActions: Story = {
  args: {
    title: "Plan",
    actions: <Badge tone="accent">Pro</Badge>,
    description: undefined,
    children: <Text tone="muted">Renews on 1 March.</Text>,
  },
};

export const DangerZone: Story = {
  args: {
    tone: "danger",
    title: "Delete workspace",
    description: "Permanently removes all projects and members. This can't be undone.",
    children: undefined,
    footer: <Button variant="danger">Delete workspace</Button>,
  },
};
