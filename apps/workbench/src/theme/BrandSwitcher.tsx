import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
// Each brand's swatch shows that brand's colours whatever theme is active,
// so it can't use theme-following semantic tokens.
// eslint-disable-next-line @dsw/no-primitive-tokens -- fixed per-brand swatches
import {
  bloomPalette,
  colorPrimitives,
  voltPalette,
} from "@dsw/tokens/primitives.stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  focus,
  fontSize,
  fontWeight,
  motion,
  radius,
  shadow,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";
import { brands } from "@dsw/tokens/themes";
import type { BrandName } from "@dsw/tokens";
import { useTheme } from "@dsw/ui";

const styles = stylex.create({
  group: {
    display: "inline-flex",
    gap: space.xxs,
    padding: space.xxs,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurfaceRaised,
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    height: size.controlSm,
    paddingInline: { default: space.md, [breakpoints.mobile]: space.sm },
    borderRadius: radius.md,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: color.fgMuted,
    fontFamily: "inherit",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    cursor: "pointer",
    outline: "none",
    transitionProperty: "background-color, color, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },
  itemHovered: {
    color: color.fgDefault,
  },
  itemSelected: {
    forcedColorAdjust: "none",
    color: {
      default: color.fgDefault,
      [breakpoints.forcedColors]: "HighlightText",
    },
    backgroundColor: {
      default: color.bgSurface,
      [breakpoints.forcedColors]: "Highlight",
    },
    boxShadow: shadow.card,
  },
  itemFocusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },
  visuallyHidden: {
    position: "absolute",
    width: "1px", // token-exempt: visually-hidden technique
    height: "1px", // token-exempt: visually-hidden technique
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
  },
  // Each brand's own signature colour, fixed regardless of the active
  // theme, so the control previews what you're switching to.
  swatch: (fill: string, ring: string) => ({
    flexShrink: 0,
    width: size.indicatorDot,
    height: size.indicatorDot,
    borderRadius: radius.full,
    backgroundColor: fill,
    boxShadow: `0 0 0 ${borderWidth.thin} ${ring}`,
  }),
});

const swatches: Record<BrandName, [fill: string, ring: string]> = {
  iris: [colorPrimitives.iris500, colorPrimitives.iris700],
  volt: [voltPalette.lime, voltPalette.ink],
  bloom: [bloomPalette.forest, bloomPalette.terracotta],
};

export function BrandSwitcher() {
  const { brand, setBrand } = useTheme();
  const id = useId();
  const descriptionId = (brandId: BrandName) => `${id}-${brandId}-description`;

  return (
    <>
      <ToggleButtonGroup
        aria-label="Brand"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[brand]}
        onSelectionChange={(keys) => {
          const [next] = [...keys];
          if (next) setBrand(next as BrandName);
        }}
        {...stylex.props(styles.group)}
      >
        {brands.map((b) => (
          <ToggleButton
            key={b.id}
            id={b.id}
            // aria-describedby, not the ARIA 1.3 draft aria-description,
            // which screen readers outside Chromium + NVDA/JAWS don't read.
            aria-describedby={descriptionId(b.id)}
            className={(rp) =>
              stylex.props(
                styles.item,
                rp.isHovered && styles.itemHovered,
                rp.isSelected && styles.itemSelected,
                rp.isFocusVisible && styles.itemFocusVisible,
              ).className ?? ""
            }
          >
            <span
              aria-hidden="true"
              {...stylex.props(styles.swatch(...swatches[b.id]))}
            />
            {b.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {brands.map((b) => (
        <span
          key={b.id}
          id={descriptionId(b.id)}
          {...stylex.props(styles.visuallyHidden)}
        >
          {b.tagline}
        </span>
      ))}
    </>
  );
}
