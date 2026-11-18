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
  size,
  space,
} from "@dsw/tokens/semantic.stylex";
import { switchShape as shape, switchTokens as t } from "@dsw/tokens/components.stylex";

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
    backgroundColor: t.trackOff,
    // Edge drawn outside the track (spread shadow) so layout never shifts.
    boxShadow: `0 0 0 ${shape.edgeWidth} ${t.trackOffEdge}`,
    transitionProperty: "background-color",
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.easeOut,
  },
  trackHovered: {
    backgroundColor: t.trackOffHover,
  },
  trackSelected: {
    backgroundColor: t.trackOn,
    boxShadow: `0 0 0 ${shape.edgeWidth} ${t.trackOnEdge}`,
  },
  trackSelectedHovered: {
    backgroundColor: t.trackOnHover,
  },
  trackDisabled: {
    backgroundColor: t.trackDisabled,
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
    borderRadius: shape.thumbRadius,
    backgroundColor: t.thumb,
    boxShadow: t.thumbShadow,
    transitionProperty: "transform",
    // Reduced motion is handled by the motion token itself.
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.easeOut,
  },
  // Travel = track width − thumb − 2 × inset, derived from tokens so the
  // thumb stays aligned if the switch size tokens change.
  thumbOn: {
    backgroundColor: t.thumbOn,
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
                rp.isSelected && styles.thumbOn,
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
