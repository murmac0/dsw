import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and responds to a click", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("supports activation via the keyboard", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    button.focus();
    await user.keyboard("{Enter}");

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("blocks activation while loading but stays focusable and keeps its accessible name", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isLoading onPress={onPress}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    button.focus();
    expect(button).toHaveFocus();

    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders every variant without throwing", () => {
    const variants = ["primary", "secondary", "ghost", "danger"] as const;

    for (const variant of variants) {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button", { name: variant })).toBeVisible();
    }
  });
});
