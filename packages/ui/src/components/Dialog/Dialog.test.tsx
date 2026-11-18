import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../Button/Button";
import { Dialog, DialogBody, DialogFooter, DialogTrigger } from "./Dialog";

function Example({ role }: { role?: "dialog" | "alertdialog" }) {
  return (
    <DialogTrigger>
      <Button>Delete project</Button>
      <Dialog title="Delete project?" {...(role && { role })}>
        {({ close }) => (
          <>
            <DialogBody>This can't be undone.</DialogBody>
            <DialogFooter>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button variant="danger" onPress={close}>
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

describe("Dialog", () => {
  it("opens with its title as the accessible name and moves focus inside", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Delete project" }));

    const dialog = screen.getByRole("dialog", { name: "Delete project?" });
    expect(dialog).toBeVisible();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);

    const trigger = screen.getByRole("button", { name: "Delete project" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // React Aria restores focus on the frame after the overlay unmounts.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes from an action inside via the render-prop close()", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Delete project" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders as an alertdialog for destructive confirmations", async () => {
    const user = userEvent.setup();
    render(<Example role="alertdialog" />);

    await user.click(screen.getByRole("button", { name: "Delete project" }));
    expect(
      screen.getByRole("alertdialog", { name: "Delete project?" }),
    ).toBeVisible();
  });
});
