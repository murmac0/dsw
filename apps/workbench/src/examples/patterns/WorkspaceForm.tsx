import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  Fieldset,
  Inline,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Stack,
  Switch,
  Text,
  TextField,
} from "@dsw/ui";

/**
 * Every control in one form. Validation is the browser's own (React Aria's
 * "native" behaviour): required and type="email" block submit, and each
 * field shows its error through the shared error slot.
 */
export default function WorkspaceForm() {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSavedAt(new Date().toLocaleTimeString());
      }}
    >
      <Card title="Workspace settings" titleLevel={2}>
        <Stack gap="xl">
          <Fieldset legend="Workspace">
            <TextField
              label="Workspace name"
              autoComplete="organization"
              defaultValue="Acme"
              isRequired
            />
            <Select label="Region" defaultValue="eu">
              <SelectItem id="eu">Europe (Frankfurt)</SelectItem>
              <SelectItem id="us">United States (Virginia)</SelectItem>
              <SelectItem id="ap">Asia Pacific (Sydney)</SelectItem>
            </Select>
          </Fieldset>
          <Fieldset legend="Billing">
            <TextField
              label="Billing email"
              name="email"
              type="email"
              autoComplete="billing email"
              isRequired
              description="Invoices are sent here."
              errorMessage="Enter a valid email address."
            />
            <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
              <Radio value="free">Free</Radio>
              <Radio value="pro">Pro</Radio>
              <Radio value="team">Team</Radio>
            </RadioGroup>
          </Fieldset>
          <Fieldset legend="Notifications">
            <CheckboxGroup
              label="Notify me by"
              name="channels"
              defaultValue={["email"]}
              isRequired
              orientation="horizontal"
              errorMessage="Choose at least one channel."
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="push">Push</Checkbox>
            </CheckboxGroup>
            <Switch defaultSelected>Email me product updates</Switch>
          </Fieldset>
          <Checkbox isRequired>I agree to the terms</Checkbox>
          <Inline gap="md">
            <Button type="submit">Save changes</Button>
            <DialogTrigger>
              <Button variant="ghost">Delete workspace</Button>
              <Dialog title="Delete workspace?" role="alertdialog" size="sm">
                {({ close }) => (
                  <>
                    <DialogBody>
                      This permanently deletes Acme and all its projects. This
                      can&apos;t be undone.
                    </DialogBody>
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
          </Inline>
          <Text role="status" size="sm" tone="muted">
            {savedAt ? `Saved at ${savedAt}` : ""}
          </Text>
        </Stack>
      </Card>
    </form>
  );
}
