import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./RadioGroup";

function Plans(props: { onChange?: (value: string) => void }) {
  return (
    <RadioGroup label="Plan" description="Billed monthly." {...props}>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("is a labelled, described radiogroup", () => {
    render(<Plans />);
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toHaveAccessibleDescription("Billed monthly.");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("moves selection with arrow keys (roving focus)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Plans onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Free" }));
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("pro");
  });
});
