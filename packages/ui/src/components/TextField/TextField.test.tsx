import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates its label and description with the input", () => {
    render(<TextField label="Email" description="We never share it." />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleDescription("We never share it.");
  });

  it("reports typed values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    expect(onChange).toHaveBeenLastCalledWith("Ada");
  });

  it("marks required fields without announcing the decorative asterisk", () => {
    render(<TextField label="Email" isRequired />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toBeRequired();
  });

  it("exposes an invalid state and links the error message", () => {
    render(<TextField label="Email" isInvalid errorMessage="Enter a valid email." />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email.");
  });
});
