import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Dialog, DialogFooter } from "./Dialog";

function Body({ close }: { close: () => void }) {
  return (
    <DialogFooter>
      <Button onPress={close}>Done</Button>
    </DialogFooter>
  );
}

describe("Dialog — controlled vs uncontrolled", () => {
  it("uncontrolled: defaultOpen shows it and close() dismisses it", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Welcome" defaultOpen>
        {({ close }) => <Body close={close} />}
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Welcome" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("controlled: close requests go to onOpenChange; the parent decides", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog title="Welcome" isOpen onOpenChange={onOpenChange}>
        {({ close }) => <Body close={close} />}
      </Dialog>,
    );

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Welcome" })).toBeVisible();

    rerender(
      <Dialog title="Welcome" isOpen={false} onOpenChange={onOpenChange}>
        {({ close }) => <Body close={close} />}
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
