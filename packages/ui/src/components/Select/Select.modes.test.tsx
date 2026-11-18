import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectItem, type SelectProps } from "./Select";

function Countries(props: Omit<SelectProps<object>, "label" | "children">) {
  return (
    <Select label="Country" {...props}>
      <SelectItem id="ie">Ireland</SelectItem>
      <SelectItem id="pt">Portugal</SelectItem>
    </Select>
  );
}

const trigger = () => screen.getByRole("button", { name: /Country/ });

describe("Select — controlled vs uncontrolled", () => {
  it("uncontrolled: starts from defaultValue and owns its state", async () => {
    const user = userEvent.setup();
    render(<Countries defaultValue="ie" />);

    expect(trigger()).toHaveTextContent("Ireland");
    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "Portugal" }));
    expect(trigger()).toHaveTextContent("Portugal");
  });

  it("controlled: reports changes but only the parent changes the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Countries value="ie" onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "Portugal" }));
    expect(onChange).toHaveBeenCalledWith("pt");
    expect(trigger()).toHaveTextContent("Ireland");

    rerender(<Countries value="pt" onChange={onChange} />);
    expect(trigger()).toHaveTextContent("Portugal");
  });

  it("controlled open state", () => {
    const { rerender } = render(<Countries isOpen={false} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    rerender(<Countries isOpen />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
