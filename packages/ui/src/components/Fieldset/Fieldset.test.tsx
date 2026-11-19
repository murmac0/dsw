import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Select, SelectItem } from "../Select/Select";
import { Switch } from "../Switch/Switch";
import { TextField } from "../TextField/TextField";
import { Fieldset } from "./Fieldset";

describe("Fieldset", () => {
  it("is a group named by its legend and described by its description", () => {
    render(
      <Fieldset legend="Shipping address" description="Where we send your order.">
        <TextField label="Street" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Shipping address" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toHaveAccessibleDescription("Where we send your order.");
  });

  it("disambiguates identically labelled fields by group", () => {
    render(
      <>
        <Fieldset legend="Shipping address">
          <TextField label="Street" defaultValue="1 Ship St" />
        </Fieldset>
        <Fieldset legend="Billing address">
          <TextField label="Street" defaultValue="2 Bill Rd" />
        </Fieldset>
      </>,
    );
    const shipping = screen.getByRole("group", { name: "Shipping address" });
    const billing = screen.getByRole("group", { name: "Billing address" });
    expect(within(shipping).getByRole("textbox", { name: "Street" })).toHaveValue("1 Ship St");
    expect(within(billing).getByRole("textbox", { name: "Street" })).toHaveValue("2 Bill Rd");
  });

  it("disables every control inside, natively and in React Aria state", () => {
    render(
      <Fieldset legend="Billing address" isDisabled>
        <TextField label="Street" />
        <Select label="Country">
          <SelectItem id="ie">Ireland</SelectItem>
        </Select>
        <Checkbox>Save for later</Checkbox>
        <Switch>Default address</Switch>
        <Button>Look up postcode</Button>
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Billing address" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Street" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Country/ })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Save for later" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Default address" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Look up postcode" })).toBeDisabled();
    // React Aria knows too, so the controls render their disabled styling.
    expect(
      screen.getByRole("checkbox", { name: "Save for later" }).closest("label"),
    ).toHaveAttribute("data-disabled", "true");
  });

  it("a disabled fieldset wins over a control's own isDisabled={false}", () => {
    render(
      <Fieldset legend="Outer" isDisabled>
        <Fieldset legend="Inner">
          <TextField label="Nested" isDisabled={false} />
        </Fieldset>
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Inner" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Nested" })).toBeDisabled();
  });

  it("links a group error only while invalid, in a persistent live region", () => {
    const { rerender } = render(
      <Fieldset legend="Address" errorMessage="Enter a complete address.">
        <TextField label="Street" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Address" });
    expect(group).not.toHaveAccessibleDescription(/complete address/);
    expect(screen.queryByText("Enter a complete address.")).not.toBeInTheDocument();
    const live = group.querySelector("[aria-live='polite']");
    expect(live).toBeInTheDocument();

    rerender(
      <Fieldset legend="Address" errorMessage="Enter a complete address." isInvalid>
        <TextField label="Street" />
      </Fieldset>,
    );
    expect(group).toHaveAccessibleDescription("Enter a complete address.");
    expect(live).toHaveTextContent("Enter a complete address.");
  });
});
