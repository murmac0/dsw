import { useState } from "react";
import {
  Button,
  Checkbox,
  CodeBlock,
  Dialog,
  DialogBody,
  DialogFooter,
  Grid,
  Inline,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Stack,
  Switch,
  TextField,
} from "@dsw/ui";

/** Parent state drives every control; the readout shows what it holds. */
export default function ControlledForm() {
  const [name, setName] = useState("Ada");
  const [country, setCountry] = useState<string | number | null>("pt");
  const [plan, setPlan] = useState("pro");
  const [notify, setNotify] = useState(true);
  const [terms, setTerms] = useState(false);
  const [isOpen, setOpen] = useState(false);

  const reset = () => {
    setName("");
    setCountry(null);
    setPlan("free");
    setNotify(false);
    setTerms(false);
  };

  return (
    <Grid columns={2} gap="lg">
      <Stack gap="md">
        <TextField label="Name" autoComplete="name" value={name} onChange={setName} />
        <Select label="Country" value={country} onChange={setCountry}>
          <SelectItem id="ie">Ireland</SelectItem>
          <SelectItem id="nz">New Zealand</SelectItem>
          <SelectItem id="pt">Portugal</SelectItem>
        </Select>
        <RadioGroup label="Plan" value={plan} onChange={setPlan} orientation="horizontal">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
        <Switch isSelected={notify} onChange={setNotify}>
          Notifications
        </Switch>
        <Checkbox isSelected={terms} onChange={setTerms}>
          Accept terms
        </Checkbox>
        <Inline gap="md">
          <Button variant="secondary" onPress={() => setOpen(true)}>
            Open controlled dialog
          </Button>
          <Button variant="ghost" onPress={reset}>
            Reset from parent
          </Button>
        </Inline>
        <Dialog title="Controlled dialog" isOpen={isOpen} onOpenChange={setOpen}>
          <DialogBody>Open state lives in the parent; Escape calls onOpenChange(false).</DialogBody>
          <DialogFooter>
            <Button onPress={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </Dialog>
      </Stack>
      <CodeBlock
        title="Parent state"
        showCopy={false}
        data-testid="controlled-state"
        code={JSON.stringify({ name, country, plan, notify, terms, isOpen }, null, 2)}
      />
    </Grid>
  );
}
