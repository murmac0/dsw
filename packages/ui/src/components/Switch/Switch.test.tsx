import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("uses switch semantics and toggles on/off", async () => {
    const user = userEvent.setup();
    render(<Switch>Wi-Fi</Switch>);

    const toggle = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});
