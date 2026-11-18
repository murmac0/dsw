import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Switch } from "./Switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Notifications", onChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultSelected: true } };
export const Disabled: Story = { args: { isDisabled: true } };

function ControlledSwitch() {
  const [isSelected, setSelected] = useState(true);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Switch isSelected={isSelected} onChange={setSelected}>
        Notifications
      </Switch>
      <output>isSelected: {String(isSelected)}</output>
    </div>
  );
}

/** Parent owns the value via `isSelected` + `onChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledSwitch />,
};
