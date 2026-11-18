import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  TextField,
  type ButtonVariant,
} from "@dsw/ui";
import type { Key } from "react-aria-components";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  shadow,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  section: {
    marginBottom: space.xxl,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    marginTop: 0,
    marginBottom: space.md,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.md,
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
  },
  grid: {
    display: "grid",
    // min(…, 100%) stops a single column overflowing very narrow screens.
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${size.gridMin}, 100%), 1fr))`,
    gap: space.lg,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
    maxWidth: size.formMax,
    padding: { default: space.xl, [breakpoints.mobile]: space.lg },
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurface,
    boxShadow: shadow.card,
  },
  status: {
    margin: 0,
    minHeight: `calc(${fontSize.sm} * 1.5)`, // reserve a line
    fontSize: fontSize.sm,
    color: color.fgMuted,
  },
  note: {
    marginTop: 0,
    marginBottom: space.md,
    fontSize: fontSize.sm,
    color: color.fgMuted,
  },
  stateReadout: {
    margin: 0,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurfaceRaised,
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  cardTitle: {
    margin: 0,
    fontFamily: fontFamily.display,
    letterSpacing: letterSpacing.tight,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
});

const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];

/**
 * The same components driven by parent state. The readout is the single
 * source of truth: the controls render whatever it holds.
 */
function ControlledExample() {
  const [name, setName] = useState("Ada");
  const [country, setCountry] = useState<Key | null>("pt");
  const [plan, setPlan] = useState("pro");
  const [notify, setNotify] = useState(true);
  const [terms, setTerms] = useState(false);
  const [isOpen, setOpen] = useState(false);

  const state = { name, country, plan, notify, terms, isOpen };

  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.stack)}>
        <TextField label="Name" value={name} onChange={setName} />
        <Select label="Country" value={country} onChange={setCountry}>
          <SelectItem id="ie">Ireland</SelectItem>
          <SelectItem id="nz">New Zealand</SelectItem>
          <SelectItem id="pt">Portugal</SelectItem>
        </Select>
        <RadioGroup
          label="Plan"
          value={plan}
          onChange={setPlan}
          orientation="horizontal"
        >
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
        <div {...stylex.props(styles.row)}>
          <Button variant="secondary" onPress={() => setOpen(true)}>
            Open controlled dialog
          </Button>
          <Button
            variant="ghost"
            onPress={() => {
              setName("");
              setCountry(null);
              setPlan("free");
              setNotify(false);
              setTerms(false);
            }}
          >
            Reset from parent
          </Button>
        </div>
        <Dialog title="Controlled dialog" isOpen={isOpen} onOpenChange={setOpen}>
          <DialogBody>
            Open state lives in the parent; Escape calls onOpenChange(false).
          </DialogBody>
          <DialogFooter>
            <Button onPress={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </Dialog>
      </div>
      <pre
        {...stylex.props(styles.stateReadout)}
        aria-label="Parent state"
        data-testid="controlled-state"
      >
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Every control in one realistic flow — the test of whether these read as
 * one system: shared label/description/error anatomy, one focus ring, one
 * set of tokens.
 */
function ComposedExample() {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Validation uses the browser's own constraint API (React Aria's default
  // "native" behaviour): required/type="email" block submit, and each field
  // renders its error through the shared FieldError slot on the attempt.
  return (
    <form
      {...stylex.props(styles.card)}
      onSubmit={(event) => {
        event.preventDefault();
        setSavedAt(new Date().toLocaleTimeString());
      }}
    >
      <h3 {...stylex.props(styles.cardTitle)}>Workspace settings</h3>
      <TextField label="Workspace name" defaultValue="Acme" isRequired />
      <TextField
        label="Billing email"
        name="email"
        type="email"
        isRequired
        description="Invoices are sent here."
        errorMessage="Enter a valid email address."
      />
      <Select label="Region" defaultValue="eu">
        <SelectItem id="eu">Europe (Frankfurt)</SelectItem>
        <SelectItem id="us">United States (Virginia)</SelectItem>
        <SelectItem id="ap">Asia Pacific (Sydney)</SelectItem>
      </Select>
      <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
      <Switch defaultSelected>Email me product updates</Switch>
      <Checkbox isRequired>I agree to the terms</Checkbox>
      <div {...stylex.props(styles.row)}>
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
      </div>
      <p role="status" {...stylex.props(styles.status)}>
        {savedAt ? `Saved at ${savedAt}` : ""}
      </p>
    </form>
  );
}

export function ComponentsPage() {
  return (
    <div>
      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Button — variants</h2>
        <div {...stylex.props(styles.row)}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Button — sizes</h2>
        <div {...stylex.props(styles.row)}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Button — states</h2>
        <div {...stylex.props(styles.row)}>
          <Button>Default</Button>
          <Button isDisabled>Disabled</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>TextField</h2>
        <div {...stylex.props(styles.grid)}>
          <TextField label="Name" placeholder="Ada Lovelace" />
          <TextField label="Email" description="We never share it." isRequired />
          <TextField
            label="Username"
            defaultValue="ada!"
            isInvalid
            errorMessage="Only letters, numbers and dashes."
          />
          <TextField label="Disabled" defaultValue="Read only" isDisabled />
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Select</h2>
        <div {...stylex.props(styles.grid)}>
          <Select label="Country" placeholder="Choose a country">
            <SelectItem id="ie">Ireland</SelectItem>
            <SelectItem id="nz">New Zealand</SelectItem>
            <SelectItem id="pt">Portugal</SelectItem>
          </Select>
          <Select label="Disabled" isDisabled defaultValue="pt">
            <SelectItem id="pt">Portugal</SelectItem>
          </Select>
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Checkbox, Switch &amp; Radio</h2>
        <div {...stylex.props(styles.grid)}>
          <div {...stylex.props(styles.stack)}>
            <Checkbox defaultSelected>Checked</Checkbox>
            <Checkbox>Unchecked</Checkbox>
            <Checkbox isIndeterminate>Indeterminate</Checkbox>
            <Checkbox isDisabled>Disabled</Checkbox>
          </div>
          <div {...stylex.props(styles.stack)}>
            <Switch defaultSelected>Notifications</Switch>
            <Switch>Dark mode sync</Switch>
            <Switch isDisabled>Disabled</Switch>
          </div>
          <RadioGroup label="Density" defaultValue="comfortable">
            <Radio value="compact">Compact</Radio>
            <Radio value="comfortable">Comfortable</Radio>
            <Radio value="spacious" isDisabled>
              Spacious
            </Radio>
          </RadioGroup>
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Dialog</h2>
        <div {...stylex.props(styles.row)}>
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
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Controlled</h2>
        <p {...stylex.props(styles.note)}>
          Every component also works uncontrolled (defaultValue,
          defaultSelected, defaultOpen) — the sections above are all
          uncontrolled.
        </p>
        <ControlledExample />
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Composed — a real form</h2>
        <ComposedExample />
      </section>
    </div>
  );
}
