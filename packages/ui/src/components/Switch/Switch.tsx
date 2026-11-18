import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
  useLocale,
} from "react-aria-components";
import {
  color,
  focus,
  fontSize,
  motion,
  radius,
  shadow,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    fontSize: fontSize.sm,
    color: color.fgDefault,
    cursor: "pointer",
    userSelect: "none",
  },
  rootDisabled: {
    cursor: "not-allowed",
    color: color.fgDisabled,
  },
  track: {
    boxSizing: "border-box",
    flexShrink: 0,
    position: "relative",
    width: size.switchTrackWidth,
    height: size.switchTrackHeight,
    borderRadius: radius.full,
    backgroundColor: color.borderStrong,
    transitionProperty: "background-color",
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.easeOut,
  },
  trackHovered: {
    backgroundColor: color.fgMuted,
  },
  trackSelected: {
    backgroundColor: color.accentDefault,
  },
  trackSelectedHovered: {
    backgroundColor: color.accentHover,
  },
  trackDisabled: {
    backgroundColor: color.accentDisabled,
  },
  trackFocusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },
  thumb: {
    position: "absolute",
    insetBlockStart: space.xxs,
    insetInlineStart: space.xxs,
    width: size.switchThumb,
    height: size.switchThumb,
    borderRadius: radius.full,
    backgroundColor: color.fgOnAccent,
    boxShadow: shadow.thumb,
    transitionProperty: "transform",
    // Reduced motion is handled by the motion token itself.
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.easeOut,
  },
  // Travel = track width − thumb − 2 × inset, derived from tokens so the
  // thumb stays aligned if the switch size tokens change.
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
  return (
    <AriaSwitch
      {...rest}
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
