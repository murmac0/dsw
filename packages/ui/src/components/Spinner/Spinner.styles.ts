import * as stylex from "@stylexjs/stylex";
import { motion } from "@dsw/tokens/semantic.stylex";

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const styles = stylex.create({
  svg: {
    animationName: spin,
    animationDuration: motion.spin,
    animationIterationCount: "infinite",
    animationTimingFunction: motion.linear,
  },
  track: {
    opacity: 0.25, // token-exempt: internal two-tone spinner drawing
  },
  indicator: {
    opacity: 0.9, // token-exempt: internal two-tone spinner drawing
  },
});

export const sizeToPixels = {
  sm: 14,
  md: 16,
  lg: 18,
} as const;
