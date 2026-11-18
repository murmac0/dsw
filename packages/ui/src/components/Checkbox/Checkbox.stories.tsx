import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Subscribe to updates", onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultSelected: true } };
export const Indeterminate: Story = { args: { isIndeterminate: true, children: "Select all" } };
export const Invalid: Story = { args: { isInvalid: true, children: "I agree to the terms" } };
export const Disabled: Story = { args: { isDisabled: true } };

function ControlledCheckbox() {
  const [isSelected, setSelected] = useState(false);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Checkbox isSelected={isSelected} onChange={setSelected}>
        Subscribe
      </Checkbox>
      <output>isSelected: {String(isSelected)}</output>
    </div>
  );
}

/** Parent owns the value via `isSelected` + `onChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledCheckbox />,
};
