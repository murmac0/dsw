import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
} from "react-aria-components";
import {
  focus,
  fontSize,
  fontWeight,
  motion,
  size,
  space,
  zIndex,
} from "@dsw/tokens/semantic.stylex";
import { fieldTokens, menuShape as shape, menuTokens as t } from "@dsw/tokens/components.stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldProps,
} from "../Field/Field";
import { fieldStyles } from "../Field/Field.styles";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";

const styles = stylex.create({
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    textAlign: "start",
    cursor: "pointer",
  },
  value: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  placeholder: {
    color: fieldTokens.placeholder,
  },
  chevron: {
    flexShrink: 0,
    color: fieldTokens.icon,
    transitionProperty: "transform",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  popover: {
    boxSizing: "border-box",
    // Match the trigger's width; React Aria sets this custom property.
    minWidth: "var(--trigger-width)",
    maxHeight: size.popoverMaxHeight,
    zIndex: zIndex.popover,
    overflowY: "auto",
    padding: space.xs,
    borderRadius: shape.radius,
    borderWidth: shape.borderWidth,
    borderStyle: "solid",
    borderColor: t.border,
    backgroundColor: t.bg,
    boxShadow: t.shadow,
  },
  listBox: {
    outline: "none",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBlock: space.sm,
    paddingInline: space.sm,
    borderRadius: shape.itemRadius,
    fontSize: fontSize.sm,
    color: t.itemFg,
    cursor: "pointer",
    outline: "none",
  },
  itemSelected: {
    color: t.itemFgSelected,
    backgroundColor: t.itemBgSelected,
    fontWeight: fontWeight.semibold,
  },
  // After itemSelected so hover/keyboard focus still shows on the
  // selected row.
  itemFocused: {
    backgroundColor: t.itemBgHover,
    // Keyboard focus in the listbox is otherwise only a background, which
    // forced-colour modes strip. An inset outline survives (as CanvasText).
    outlineStyle: { default: null, [breakpoints.forcedColors]: "solid" },
    outlineWidth: { default: null, [breakpoints.forcedColors]: focus.width },
    outlineOffset: { default: null, [breakpoints.forcedColors]: `calc(-1 * ${focus.width})` },
  },
  itemDisabled: {
    cursor: "not-allowed",
    color: t.itemFgDisabled,
  },
  check: {
    color: t.check,
  },
});

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children" | "className" | "style">,
    FieldProps {
  /** Items for dynamic collections; pair with a render-function `children`. */
  items?: Iterable<T>;
  children: ReactNode | ((item: T) => ReactNode);
}

function SelectInner<T extends object>(
  { label, description, errorMessage, items, children, ...rest }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const inheritedDisabled = useInheritedDisabled(rest.isDisabled);
  return (
    <AriaSelect
      {...rest}
      {...(inheritedDisabled !== undefined && { isDisabled: inheritedDisabled })}
      ref={ref}
      {...stylex.props(fieldStyles.root)}
    >
      {({ isOpen, isDisabled, isInvalid }) => (
        <>
          <FieldLabel isRequired={rest.isRequired} isDisabled={isDisabled} announceRequired>
            {label}
          </FieldLabel>
          <AriaButton
            className={(rp) =>
              stylex.props(
                fieldStyles.control,
                styles.trigger,
                !rp.isDisabled && rp.isHovered && fieldStyles.controlHovered,
                (rp.isFocusVisible || isOpen) && fieldStyles.controlFocused,
                isInvalid && fieldStyles.controlInvalid,
                rp.isDisabled && fieldStyles.controlDisabled,
              ).className ?? ""
            }
          >
            <SelectValue<T>
              className={(rp) =>
                stylex.props(styles.value, rp.isPlaceholder && styles.placeholder)
                  .className ?? ""
              }
            />
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}
            >
              <path
                d="m4 6 4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </AriaButton>
          <FieldDescription>{description}</FieldDescription>
          <FieldError>{errorMessage}</FieldError>
          <Popover offset={4} {...stylex.props(styles.popover)}>
            <ListBox<T> {...(items && { items })} {...stylex.props(styles.listBox)}>
              {children}
            </ListBox>
          </Popover>
        </>
      )}
    </AriaSelect>
  );
}

/**
 * Generic over the item type so dynamic `items` stay typed. forwardRef
 * erases generics, hence the cast.
 *
 * Controlled: `value` + `onChange` (the selected item's `id`, or null).
 * Uncontrolled: `defaultValue`. Open state can be controlled the same way
 * with `isOpen` / `defaultOpen` / `onOpenChange`.
 */
export const Select = forwardRef(SelectInner) as <T extends object>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof SelectInner>;

export type SelectItemProps<T extends object = object> = Omit<
  ListBoxItemProps<T>,
  "className" | "style" | "children"
> & { children: ReactNode };

/**
 * One option in a Select's menu. Give it an `id` (the value Select reports)
 * and plain-text children; for rich children also pass `textValue` so
 * typeahead and the selected-value label still work.
 */
export function SelectItem<T extends object>({
  children,
  ...rest
}: SelectItemProps<T>) {
  return (
    <ListBoxItem
      {...rest}
      // Plain-text label for typeahead when children isn't a string.
      {...(rest.textValue === undefined &&
        typeof children === "string" && { textValue: children })}
      className={(rp) =>
        stylex.props(
          styles.item,
          rp.isSelected && styles.itemSelected,
          (rp.isFocused || rp.isHovered) && styles.itemFocused,
          rp.isDisabled && styles.itemDisabled,
        ).className ?? ""
      }
    >
      {(rp) => (
        <>
          {children}
          {rp.isSelected && (
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              {...stylex.props(styles.check)}
            >
              <path
                d="M2.5 6.2 5 8.5l4.5-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </>
      )}
    </ListBoxItem>
  );
}
