import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { Text } from "../Text/Text";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

function Example(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Settings sections">
        <Tab id="general">General</Tab>
        <Tab id="members">Members</Tab>
        <Tab id="billing">Billing</Tab>
        <Tab id="audit" isDisabled>Audit log</Tab>
      </TabList>
      <TabPanel id="general"><Text>Workspace name, region and notifications.</Text></TabPanel>
      <TabPanel id="members"><Text>Who has access, and their roles.</Text></TabPanel>
      <TabPanel id="billing"><Text>Plan, payment method and invoices.</Text></TabPanel>
      <TabPanel id="audit"><Text>Every change, by whom.</Text></TabPanel>
    </Tabs>
  );
}

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: { children: null },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DefaultSelected: Story = { args: { defaultSelectedKey: "billing" } };

function ControlledTabs() {
  const [selected, setSelected] = useState<Key>("members");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Example selectedKey={selected} onSelectionChange={setSelected} />
      <output>selectedKey: {String(selected)}</output>
    </div>
  );
}

/** Parent owns the selection via `selectedKey` + `onSelectionChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledTabs />,
};
