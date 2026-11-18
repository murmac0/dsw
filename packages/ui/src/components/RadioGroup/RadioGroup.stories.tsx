import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Radio, RadioGroup } from "./RadioGroup";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Plan",
    defaultValue: "pro",
    onChange: fn(),
    children: (
      <>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </>
    ),
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const WithDescription: Story = { args: { description: "You can change plans any time." } };
export const Invalid: Story = {
  args: { defaultValue: null, isInvalid: true, errorMessage: "Choose a plan to continue." },
};

function ControlledRadioGroup() {
  const [value, setValue] = useState("pro");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <RadioGroup label="Plan" value={value} onChange={setValue}>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
      <output>value: {JSON.stringify(value)}</output>
    </div>
  );
}

/** Parent owns the value via `value` + `onChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledRadioGroup />,
};
