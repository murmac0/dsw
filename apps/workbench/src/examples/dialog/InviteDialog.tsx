import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  TextField,
} from "@dsw/ui";

export default function InviteDialog() {
  return (
    <DialogTrigger>
      <Button variant="secondary">Open dialog</Button>
      <Dialog title="Invite teammates">
        {({ close }) => (
          <>
            <DialogBody>They&apos;ll get an email with a link to join.</DialogBody>
            <TextField label="Email addresses" placeholder="name@company.com" />
            <DialogFooter>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Send invites</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
