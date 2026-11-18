import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("toggles via click and Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Subscribe</Checkbox>);

    const box = screen.getByRole("checkbox", { name: "Subscribe" });
    await user.click(box);
    expect(box).toBeChecked();

    await user.keyboard(" ");
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("supports the indeterminate state", () => {
    render(<Checkbox isIndeterminate>Select all</Checkbox>);
    expect(
      screen.getByRole("checkbox", { name: "Select all" }),
    ).toBePartiallyChecked();
  });

  it("is not toggleable when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox isDisabled>Subscribe</Checkbox>);

    const box = screen.getByRole("checkbox", { name: "Subscribe" });
    await user.click(box);
    expect(box).toBeDisabled();
    expect(box).not.toBeChecked();
  });
});
