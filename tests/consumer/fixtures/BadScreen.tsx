// Breaks each design-system lint rule once, for the lint check.
import * as stylex from "@stylexjs/stylex";
import { Dialog } from "react-aria-components";
import { colorPrimitives } from "@dsw/tokens/primitives.stylex";

const styles = stylex.create({
  row: { display: "flex", gap: "12px" },
  title: { color: "#336699" },
  brand: { color: colorPrimitives.violet500 },
});

export function BadScreen() {
  return (
    <div {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.title, styles.brand)} style={{ margin: 4 }}>
        Title
      </span>
      <button type="button">Go</button>
      <Dialog />
    </div>
  );
}
