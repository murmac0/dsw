import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { Spinner } from "../Spinner/Spinner";
import { styles } from "./Button.styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const hoveredStyleByVariant = {
  primary: styles.hoveredPrimary,
  secondary: styles.hoveredSecondary,
  ghost: styles.hoveredGhost,
  danger: styles.hoveredDanger,
} as const satisfies Record<ButtonVariant, stylex.StyleXStyles>;

export interface ButtonProps
  extends Omit<AriaButtonProps, "children" | "className" | "style"> {
  /** Visual treatment. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Defaults to "md". */
  size?: ButtonSize;
  /**
   * Shows a spinner and blocks activation while true, but — unlike
   * `isDisabled` — keeps the button focusable so keyboard/AT users don't
   * lose their place when an action starts.
   */
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      isDisabled = false,
      onPress,
      children,
      ...rest
    },
    ref,
  ) {
    const isBlockedByLoading = isLoading && !isDisabled;

    return (
      <>
        <AriaButton
          {...rest}
          {...(isBlockedByLoading ? { "aria-disabled": true } : {})}
          ref={ref}
          isDisabled={isDisabled}
          onPress={(event) => {
            if (isLoading) return;
            onPress?.(event);
          }}
          className={(renderProps) => {
            const isVisuallyDisabled = renderProps.isDisabled || isLoading;

            return stylex.props(
              styles.base,
              styles[variant],
              styles[size],
              !isVisuallyDisabled &&
                renderProps.isHovered &&
                hoveredStyleByVariant[variant],
              !isVisuallyDisabled && renderProps.isPressed && styles.pressed,
              !isVisuallyDisabled &&
                renderProps.isPressed &&
                (variant === "primary" ? styles.pressedPrimary : styles.pressedFlat),
              renderProps.isFocusVisible && styles.focusVisible,
              isVisuallyDisabled && styles.disabled,
            ).className ?? "";
          }}
        >
          <span {...stylex.props(isLoading && styles.hiddenLabel)}>
            {children}
          </span>
          {isLoading && <Spinner size={size} style={styles.spinner} />}
        </AriaButton>
        {/*
          Sibling, not a child of the button: nested text — even visually
          hidden — still feeds the button's accessible name computation,
          which would turn "Save" into "Save Loading" while loading.
        */}
        <span
          {...stylex.props(styles.visuallyHiddenStatus)}
          role="status"
          aria-live="polite"
        >
          {isLoading ? "Loading" : ""}
        </span>
      </>
    );
  },
);
