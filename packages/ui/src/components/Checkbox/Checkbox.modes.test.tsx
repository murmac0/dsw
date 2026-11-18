import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../Switch/Switch";
import { Checkbox } from "./Checkbox";

// Checkbox and Switch share the isSelected / defaultSelected contract.
describe.each([
  ["Checkbox", Checkbox, "checkbox"],
  ["Switch", Switch, "switch"],
] as const)("%s — controlled vs uncontrolled", (_, Component, role) => {
  it("uncontrolled: starts from defaultSelected and toggles itself", async () => {
    const user = userEvent.setup();
    render(<Component defaultSelected>Option</Component>);

    const control = screen.getByRole(role, { name: "Option" });
    expect(control).toBeChecked();
    await user.click(control);
    expect(control).not.toBeChecked();
  });

  it("controlled: reports changes but only the parent flips it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Component isSelected={false} onChange={onChange}>
        Option
      </Component>,
    );

    const control = screen.getByRole(role, { name: "Option" });
    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(control).not.toBeChecked();

    rerender(
      <Component isSelected onChange={onChange}>
        Option
      </Component>,
    );
    expect(control).toBeChecked();
  });
});
