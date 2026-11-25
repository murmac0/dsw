import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { borderWidth, color, radius, space } from "@dsw/tokens/semantic.stylex";
import { Radio, RadioGroup, Stack, Text, useTheme } from "@dsw/ui";
import { frameUrl } from "../frame";
import { SettingsPage } from "./SettingsPage";

/**
 * The settings page example, inline or in a frame at phone or tablet width.
 * Breakpoints follow the window, so a frame is the only way to show the
 * real narrow layout beside a wide one.
 */
const WIDTHS = {
  full: { label: "Full width", px: null },
  tablet: { label: "Tablet (768px)", px: 768 },
  phone: { label: "Phone (375px)", px: 375 },
} as const;
type Width = keyof typeof WIDTHS;

const styles = stylex.create({
  stage: {
    display: "flex",
    justifyContent: "center",
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurfaceRaised,
  },
  frame: {
    display: "block",
    // Never wider than the page: on a small screen the frame shrinks
    // rather than scrolling sideways.
    maxWidth: "100%",
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderStrong,
    borderRadius: radius.md,
    backgroundColor: color.bgCanvas,
  },
});

export function SettingsExamplePage() {
  const { brand, theme } = useTheme();
  const [width, setWidth] = useState<Width>("full");
  const px = WIDTHS[width].px;
  const src = frameUrl("settings-page", brand, theme);

  return (
    <Stack gap="lg">
      <RadioGroup
        label="Preview width"
        orientation="horizontal"
        value={width}
        onChange={(value) => setWidth(value as Width)}
      >
        {Object.entries(WIDTHS).map(([id, w]) => (
          <Radio key={id} value={id}>
            {w.label}
          </Radio>
        ))}
      </RadioGroup>
      {px === null ? (
        <SettingsPage />
      ) : (
        <Stack gap="sm">
          <div {...stylex.props(styles.stage)}>
            <iframe
              // Reload on theme change, so the frame matches the page.
              key={src}
              src={src}
              title={`Settings page at ${WIDTHS[width].label.toLowerCase()}`}
              width={px}
              height={720}
              {...stylex.props(styles.frame)}
            />
          </div>
          <Text size="sm" tone="muted">
            The frame is its own window, so the page lays out exactly as it
            would on that screen.
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
