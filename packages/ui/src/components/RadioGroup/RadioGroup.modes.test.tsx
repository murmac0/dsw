import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup, type RadioGroupProps } from "./RadioGroup";

function Plans(props: Omit<RadioGroupProps, "label" | "children">) {
  return (
    <RadioGroup label="Plan" {...props}>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioGroup>
  );
}

describe("RadioGroup — controlled vs uncontrolled", () => {
  it("uncontrolled: starts from defaultValue and owns its state", async () => {
    const user = userEvent.setup();
    render(<Plans defaultValue="free" />);

    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
  });

  it("controlled: reports changes but only the parent moves selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Plans value="free" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(onChange).toHaveBeenCalledWith("pro");
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();

    rerender(<Plans value="pro" onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
  });
});
