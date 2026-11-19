import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Checkbox } from "../Checkbox/Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

const options = (
  <>
    <Checkbox value="email">Email</Checkbox>
    <Checkbox value="sms">SMS</Checkbox>
    <Checkbox value="push">Push notifications</Checkbox>
  </>
);

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Notify me by",
    defaultValue: ["email"],
    onChange: fn(),
    children: options,
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const WithDescription: Story = {
  args: { description: "We'll only message you about your orders." },
};
export const Required: Story = {
  args: { isRequired: true, defaultValue: [], description: "Choose at least one." },
};
export const Invalid: Story = {
  args: { defaultValue: [], isInvalid: true, errorMessage: "Choose at least one channel." },
};
export const Disabled: Story = { args: { isDisabled: true } };

function ControlledCheckboxGroup() {
  const [value, setValue] = useState<string[]>(["sms"]);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <CheckboxGroup label="Notify me by" value={value} onChange={setValue}>
        {options}
      </CheckboxGroup>
      <output>value: {JSON.stringify(value)}</output>
    </div>
  );
}

/** Parent owns the value via `value` + `onChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledCheckboxGroup />,
};
