import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Switch,
  TextField,
  type ButtonSize,
  type ButtonVariant,
} from "@dsw/ui";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  fontFamily,
  fontSize,
  radius,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  layout: {
    display: "grid",
    // Controls beside the preview on tablet+, stacked above it on phones.
    gridTemplateColumns: {
      default: `${size.sidebar} minmax(0, 1fr)`,
      [breakpoints.mobile]: "minmax(0, 1fr)",
    },
    gap: { default: space.xxl, [breakpoints.mobile]: space.xl },
    alignItems: "start",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  preview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: size.gridMin,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurfaceRaised,
  },
  snippet: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.bgSurfaceRaised,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.mono,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    color: color.fgDefault,
  },
});

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

export function PlaygroundPage() {
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [size, setSize] = useState<ButtonSize>("md");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState("Continue");

  // Controls are built from the system's own components — the playground
  // dogfoods @dsw/ui rather than hand-rolling native inputs.
  return (
    <div {...stylex.props(styles.layout)}>
      <div {...stylex.props(styles.controls)}>
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
          value={size}
          onChange={(key) => setSize(key as ButtonSize)}
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
      </div>

      <div>
        <div {...stylex.props(styles.preview)}>
          <Button
            variant={variant}
            size={size}
            isDisabled={isDisabled}
            isLoading={isLoading}
          >
            {label || " "}
          </Button>
        </div>
        <pre {...stylex.props(styles.snippet)}>
          {buildSnippet({ variant, size, isDisabled, isLoading, label })}
        </pre>
      </div>
    </div>
  );
}
