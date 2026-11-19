import * as stylex from "@stylexjs/stylex";
import { sizeToPixels, styles } from "./Spinner.styles";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  style?: stylex.StyleXStyles;
}

/**
 * Purely decorative (aria-hidden). The busy state it represents is
 * announced by the control that renders it. Button uses a polite
 * `role="status"` sibling, because react-aria-components doesn't forward
 * `aria-busy` (see ARCHITECTURE.md, "The loading-state accessibility
 * detail").
 */
export function Spinner({ size = "md", style }: SpinnerProps) {
  const pixels = sizeToPixels[size];

  return (
    <svg
      {...stylex.props(styles.svg, style)}
      width={pixels}
      height={pixels}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        {...stylex.props(styles.track)}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        {...stylex.props(styles.indicator)}
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
