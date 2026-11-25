import { useState, type ReactNode } from "react";
import {
  Button,
  CodeBlock,
  Grid,
  Heading,
  Select,
  SelectItem,
  Stack,
  Switch,
  Text,
  TextField,
  type ButtonSize,
  type ButtonVariant,
} from "@dsw/ui";
import { Example } from "../docs";

/**
 * The component and pattern pages. Each example is a file under
 * src/examples, rendered live with its source behind "Show code".
 */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Stack as="section" gap="md" aria-labelledby={id}>
      <Stack gap="xs">
        <Heading level={2} size="xl" id={id}>
          {title}
        </Heading>
        {note && <Text tone="muted">{note}</Text>}
      </Stack>
      {children}
    </Stack>
  );
}

const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

function buildSnippet(props: {
  variant: ButtonVariant;
  size: ButtonSize;
  isDisabled: boolean;
  isLoading: boolean;
  label: string;
}): string {
  const attrs: string[] = [];
  if (props.variant !== "primary") attrs.push(`variant="${props.variant}"`);
  if (props.size !== "md") attrs.push(`size="${props.size}"`);
  if (props.isDisabled) attrs.push("isDisabled");
  if (props.isLoading) attrs.push("isLoading");
  const attrsString = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
  return `<Button${attrsString}>${props.label}</Button>`;
}

/** Every Button prop that changes how it looks, and the code for it. */
function ButtonPlayground() {
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [buttonSize, setButtonSize] = useState<ButtonSize>("md");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState("Continue");

  return (
    <Grid columns={2} gap="xl">
      <Stack gap="md">
        <TextField label="Label" value={label} onChange={setLabel} />
        <Select
          label="Variant"
          value={variant}
          onChange={(key) => setVariant(key as ButtonVariant)}
        >
          {variants.map((option) => (
            <SelectItem key={option} id={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Size"
          value={buttonSize}
          onChange={(key) => setButtonSize(key as ButtonSize)}
        >
          {sizes.map((option) => (
            <SelectItem key={option} id={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
        <Switch isSelected={isDisabled} onChange={setIsDisabled}>
          isDisabled
        </Switch>
        <Switch isSelected={isLoading} onChange={setIsLoading}>
          isLoading
        </Switch>
      </Stack>
      <Stack gap="md">
        <Stack gap="none" align="center">
          <Button
            variant={variant}
            size={buttonSize}
            isDisabled={isDisabled}
            isLoading={isLoading}
          >
            {label || " "}
          </Button>
        </Stack>
        <CodeBlock
          title="Your button"
          code={buildSnippet({ variant, size: buttonSize, isDisabled, isLoading, label })}
        />
      </Stack>
    </Grid>
  );
}

export function ButtonPage() {
  return (
    <Stack gap="xxl">
      <Section title="Try it" note="Change the props; the code updates with them.">
        <ButtonPlayground />
      </Section>
      <Section
        title="Variants"
        note="Primary for the one main action in a view, secondary for alternatives, ghost for low emphasis, danger for destructive actions."
      >
        <Example name="button/Variants" />
      </Section>
      <Section
        title="Sizes"
        note="Control sizes are shared with TextField and Select, so a row of mixed controls lines up."
      >
        <Example name="button/Sizes" />
      </Section>
      <Section
        title="States"
        note="A loading button keeps its name and stays focusable, but can't be pressed again. Press Save draft to see it."
      >
        <Example name="button/States" />
      </Section>
    </Stack>
  );
}

export function TextFieldPage() {
  return (
    <Section
      title="States"
      note="Label, description and error are linked to the input, so screen readers read them with it."
    >
      <Example name="text-field/States" />
    </Section>
  );
}

export function SelectPage() {
  return (
    <Section
      title="States"
      note="Open it with Enter, Space or the arrow keys; type to jump to an option."
    >
      <Example name="select/States" />
    </Section>
  );
}

export function SelectionControlsPage() {
  return (
    <Stack gap="xxl">
      <Section title="Checkbox, switch and radio">
        <Example name="selection/Controls" />
      </Section>
      <Section
        title="Checkbox group"
        note="A labelled set of checkboxes with one array value, validated as a group."
      >
        <Example name="selection/CheckboxGroups" />
      </Section>
    </Stack>
  );
}

export function FieldsetPage() {
  return (
    <Section
      title="Shipping and billing"
      note="Both groups contain Street and City: the legend tells a screen reader user which one they're in. Untick the checkbox and the billing group enables."
    >
      <Example name="fieldset/ShippingAndBilling" />
    </Section>
  );
}

export function DialogPage() {
  return (
    <Section
      title="Example"
      note="Open it, press Tab: focus stays inside. Escape closes it and focus goes back to the button."
    >
      <Example name="dialog/InviteDialog" />
    </Section>
  );
}

export function FormPatternPage() {
  return <Example name="patterns/WorkspaceForm" />;
}

export function ControlledPatternPage() {
  return (
    <Section
      title="Controlled"
      note="Every component also works uncontrolled (defaultValue, defaultSelected, defaultOpen): the component pages use that."
    >
      <Example name="patterns/ControlledForm" />
    </Section>
  );
}
