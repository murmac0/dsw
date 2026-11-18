import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { TextField } from "./TextField";

const meta = {
  title: "Components/TextField",
  component: TextField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "you@example.com", onChange: fn() },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "We'll only use this for receipts." },
};
export const Required: Story = { args: { isRequired: true } };
export const Invalid: Story = {
  args: {
    defaultValue: "not-an-email",
    isInvalid: true,
    errorMessage: "Enter a valid email address.",
  },
};
export const Disabled: Story = { args: { isDisabled: true, defaultValue: "ada@example.com" } };

function ControlledTextField() {
  const [value, setValue] = useState("Ada");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TextField label="Name" value={value} onChange={setValue} />
      <output>value: {JSON.stringify(value)}</output>
    </div>
  );
}

/** Parent owns the value via `value` + `onChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledTextField />,
};

/** Field owns its state; seed it with `defaultValue`. */
export const Uncontrolled: Story = { args: { defaultValue: "Ada" } };
