import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "../Checkbox/Checkbox";
import { Select, SelectItem } from "../Select/Select";
import { TextField } from "../TextField/TextField";
import { Fieldset } from "./Fieldset";

function AddressFields({ section = "shipping" }: { section?: "shipping" | "billing" }) {
  return (
    <>
      <TextField label="Street" autoComplete={`${section} street-address`} />
      <TextField label="City" autoComplete={`${section} address-level2`} />
      <Select label="Country" defaultValue="ie" autoComplete={`${section} country`}>
        <SelectItem id="ie">Ireland</SelectItem>
        <SelectItem id="pt">Portugal</SelectItem>
      </Select>
    </>
  );
}

const meta = {
  title: "Components/Fieldset",
  component: Fieldset,
  tags: ["autodocs"],
  args: {
    legend: "Shipping address",
    description: "Where we send your order.",
    children: <AddressFields />,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "boxed"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 440 }}><Story /></div>],
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {};
export const Boxed: Story = { args: { variant: "boxed" } };
export const Invalid: Story = {
  args: { variant: "boxed", isInvalid: true, errorMessage: "Enter a complete address." },
};
export const Disabled: Story = { args: { variant: "boxed", isDisabled: true } };

function SameAsShipping() {
  const [same, setSame] = useState(true);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Fieldset legend="Shipping address" variant="boxed">
        <AddressFields />
      </Fieldset>
      <Checkbox isSelected={same} onChange={setSame}>
        Billing address is the same as shipping
      </Checkbox>
      <Fieldset legend="Billing address" variant="boxed" isDisabled={same}>
        <AddressFields section="billing" />
      </Fieldset>
    </div>
  );
}

/**
 * Why fieldsets matter: both groups contain a "Street" field. The legend
 * is what tells a screen reader user which one they're in. Toggling the
 * checkbox disables the whole billing group in one prop.
 */
export const ShippingAndBilling: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SameAsShipping />,
};
