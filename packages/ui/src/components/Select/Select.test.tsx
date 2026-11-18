import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectItem } from "./Select";

function CountrySelect(props: { onChange?: (key: unknown) => void }) {
  return (
    <Select label="Country" placeholder="Choose a country" {...props}>
      <SelectItem id="ie">Ireland</SelectItem>
      <SelectItem id="nz">New Zealand</SelectItem>
      <SelectItem id="pt">Portugal</SelectItem>
    </Select>
  );
}

describe("Select", () => {
  it("shows the placeholder and opens a listbox of options", async () => {
    const user = userEvent.setup();
    render(<CountrySelect />);

    const trigger = screen.getByRole("button", { name: /Country/ });
    expect(trigger).toHaveTextContent("Choose a country");

    await user.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CountrySelect onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Country/ }));
    await user.click(screen.getByRole("option", { name: "Portugal" }));

    expect(onChange).toHaveBeenCalledWith("pt");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Country/ })).toHaveTextContent(
      "Portugal",
    );
  });
});
