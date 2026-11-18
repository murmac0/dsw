import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField — controlled vs uncontrolled", () => {
  it("uncontrolled: starts from defaultValue and owns its state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField label="Name" defaultValue="Ada" onChange={onChange} />);

    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveValue("Ada");
    await user.type(input, "!");
    expect(input).toHaveValue("Ada!");
    expect(onChange).toHaveBeenLastCalledWith("Ada!");
  });

  it("controlled: renders only what the parent passes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <TextField label="Name" value="Ada" onChange={onChange} />,
    );

    const input = screen.getByRole("textbox", { name: "Name" });
    await user.type(input, "!");
    expect(onChange).toHaveBeenLastCalledWith("Ada!");
    // Parent didn't update `value`, so the field must not change.
    expect(input).toHaveValue("Ada");

    rerender(<TextField label="Name" value="Grace" onChange={onChange} />);
    expect(input).toHaveValue("Grace");
  });
});
