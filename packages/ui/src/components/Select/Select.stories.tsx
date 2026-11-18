import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { fn } from "storybook/test";
import { Select, SelectItem, type SelectProps } from "./Select";

// Explicitly annotated: Select is generic, so the inferred meta type would
// reference a non-portable @react-types path.
const meta: Meta<SelectProps<object>> = {
  title: "Components/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Country",
    placeholder: "Choose a country",
    onChange: fn(),
    children: [
      <SelectItem key="ie" id="ie">Ireland</SelectItem>,
      <SelectItem key="nz" id="nz">New Zealand</SelectItem>,
      <SelectItem key="pt" id="pt">Portugal</SelectItem>,
    ],
  },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "pt" } };
export const WithDescription: Story = { args: { description: "Used for tax calculation." } };
export const Invalid: Story = { args: { isInvalid: true, errorMessage: "Choose a country." } };
export const Disabled: Story = { args: { isDisabled: true } };

function ControlledSelect() {
  const [value, setValue] = useState<Key | null>("pt");
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Select label="Country" value={value} onChange={setValue}>
        <SelectItem id="ie">Ireland</SelectItem>
        <SelectItem id="nz">New Zealand</SelectItem>
        <SelectItem id="pt">Portugal</SelectItem>
      </Select>
      <output>value: {JSON.stringify(value)}</output>
    </div>
  );
}

/** Parent owns the value via `value` + `onChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledSelect />,
};
