import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
  useLocale,
} from "react-aria-components";
import {
  borderWidth,
  color,
  focus,
  fontSize,
  motion,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";
import { switchShape as shape, switchTokens as t } from "@dsw/tokens/components.stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";

const styles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    fontSize: fontSize.sm,
    color: t.label,
    cursor: "pointer",
    userSelect: "none",
  },
  rootDisabled: {
    cursor: "not-allowed",
    color: t.disabledLabel,
  },
  track: {
    boxSizing: "border-box",
    flexShrink: 0,
    position: "relative",
    width: size.switchTrackWidth,
    height: size.switchTrackHeight,
    borderRadius: shape.trackRadius,
    // The track and thumb are pure fills, which forced-colour modes strip.
    // Opt out and redraw them in system colours so state stays visible.
    forcedColorAdjust: "none",
    backgroundColor: { default: t.trackOff, [breakpoints.forcedColors]: "Canvas" },
    // Edge drawn outside the track (spread shadow) so layout never shifts.
    boxShadow: {
      default: `0 0 0 ${shape.edgeWidth} ${t.trackOffEdge}`,
      [breakpoints.forcedColors]: `inset 0 0 0 ${borderWidth.thin} CanvasText`,
    },
    transitionProperty: "background-color",
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.easeOut,
  },
  trackHovered: {
    backgroundColor: { default: t.trackOffHover, [breakpoints.forcedColors]: "Canvas" },
  },
  trackSelected: {
    backgroundColor: { default: t.trackOn, [breakpoints.forcedColors]: "Highlight" },
    boxShadow: {
      default: `0 0 0 ${shape.edgeWidth} ${t.trackOnEdge}`,
      [breakpoints.forcedColors]: "none",
    },
  },
  trackSelectedHovered: {
    backgroundColor: { default: t.trackOnHover, [breakpoints.forcedColors]: "Highlight" },
  },
  trackDisabled: {
    backgroundColor: { default: t.trackDisabled, [breakpoints.forcedColors]: "Canvas" },
    boxShadow: {
      default: null,
      [breakpoints.forcedColors]: `inset 0 0 0 ${borderWidth.thin} GrayText`,
    },
  },
  trackFocusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: { default: color.borderFocus, [breakpoints.forcedColors]: "Highlight" },
  },
  thumb: {
    position: "absolute",
    insetBlockStart: space.xxs,
    insetInlineStart: space.xxs,
    width: size.switchThumb,
    height: size.switchThumb,
    borderRadius: shape.thumbRadius,
    forcedColorAdjust: "none",
    backgroundColor: { default: t.thumb, [breakpoints.forcedColors]: "CanvasText" },
    boxShadow: { default: t.thumbShadow, [breakpoints.forcedColors]: "none" },
    transitionProperty: "transform",
    // Reduced motion is handled by the motion token itself.
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.easeOut,
  },
  // Travel = track width − thumb − 2 × inset, derived from tokens so the
  // thumb stays aligned if the switch size tokens change.
  thumbOn: {
    backgroundColor: { default: t.thumbOn, [breakpoints.forcedColors]: "HighlightText" },
  },
  thumbDisabled: {
    backgroundColor: { default: null, [breakpoints.forcedColors]: "GrayText" },
  },
  thumbSelected: {
    transform: `translateX(calc(${size.switchTrackWidth} - ${size.switchThumb} - 2 * ${space.xxs}))`,
  },
  // In RTL the thumb travels the other way.
  thumbSelectedRtl: {
    transform: `translateX(calc(-1 * (${size.switchTrackWidth} - ${size.switchThumb} - 2 * ${space.xxs})))`,
  },
});

export interface SwitchProps
  extends Omit<AriaSwitchProps, "children" | "className" | "style"> {
  children?: ReactNode;
}

/**
 * For settings that take effect immediately. Use Checkbox instead when the
 * value is only applied on form submit — that's the distinction screen
 * reader users rely on (role="switch" announces "on/off", not "checked").
 *
 * Controlled: `isSelected` + `onChange`. Uncontrolled: `defaultSelected`.
 */
export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
  { children, ...rest },
  ref,
) {
  const { direction } = useLocale();
  const isDisabled = useInheritedDisabled(rest.isDisabled);
  return (
    <AriaSwitch
      {...rest}
      {...(isDisabled !== undefined && { isDisabled })}
      ref={ref}
      className={(rp) =>
        stylex.props(styles.root, rp.isDisabled && styles.rootDisabled).className ?? ""
      }
    >
      {(rp) => (
        <>
          <span
            aria-hidden="true"
            {...stylex.props(
              styles.track,
              !rp.isDisabled && rp.isHovered && styles.trackHovered,
              rp.isSelected && styles.trackSelected,
              rp.isSelected && !rp.isDisabled && rp.isHovered && styles.trackSelectedHovered,
              rp.isDisabled && styles.trackDisabled,
              rp.isFocusVisible && styles.trackFocusVisible,
            )}
          >
            <span
              {...stylex.props(
                styles.thumb,
                rp.isSelected && styles.thumbOn,
                rp.isDisabled && styles.thumbDisabled,
                rp.isSelected &&
                  (direction === "rtl" ? styles.thumbSelectedRtl : styles.thumbSelected),
              )}
            />
          </span>
          {children}
        </>
      )}
    </AriaSwitch>
  );
});
