import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button";
import { TextField } from "../TextField/TextField";
import { Dialog, DialogBody, DialogFooter, DialogTrigger } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { title: "Invite teammates", children: null },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    role: { control: "inline-radio", options: ["dialog", "alertdialog"] },
  },
  render: (args) => (
    <DialogTrigger>
      <Button variant="secondary">Open dialog</Button>
      <Dialog {...args}>
        {({ close }) => (
          <>
            <DialogBody>They&apos;ll get an email with a link to join.</DialogBody>
            <TextField label="Email addresses" placeholder="name@company.com" />
            <DialogFooter>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button onPress={close}>Send invites</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DestructiveConfirm: Story = {
  args: { title: "Delete project?", role: "alertdialog", size: "sm" },
  render: (args) => (
    <DialogTrigger>
      <Button variant="danger">Delete project</Button>
      <Dialog {...args}>
        {({ close }) => (
          <>
            <DialogBody>This permanently deletes the project. This can&apos;t be undone.</DialogBody>
            <DialogFooter>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button variant="danger" onPress={close}>Delete</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

function ControlledDialog() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        Open (controlled)
      </Button>
      <Dialog title="Controlled dialog" isOpen={isOpen} onOpenChange={setOpen}>
        <DialogBody>
          The parent owns <code>isOpen</code>. Escape and outside clicks call
          <code> onOpenChange(false)</code>.
        </DialogBody>
        <DialogFooter>
          <Button onPress={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

/** No DialogTrigger: open state lives in the parent. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDialog />,
};
