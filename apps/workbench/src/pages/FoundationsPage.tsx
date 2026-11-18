import * as stylex from "@stylexjs/stylex";
import {
  borderWidth,
  color,
  fontSize,
  fontWeight,
  lineHeight,
  motion,
  radius,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  section: {
    marginBottom: space.xxl,
  },
  heading: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: 0,
    marginBottom: space.xs,
  },
  note: {
    marginTop: 0,
    marginBottom: space.md,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    color: color.fgMuted,
  },
  swatchGrid: {
    display: "grid",
    // min(…, 100%) keeps a single column from overflowing very narrow screens.
    gridTemplateColumns: `repeat(auto-fill, minmax(min(${size.gridMin}, 100%), 1fr))`,
    gap: space.md,
  },
  swatch: {
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    overflow: "hidden",
  },
  swatchFill: (backgroundColor: string) => ({
    height: size.controlLg,
    backgroundColor,
  }),
  label: {
    padding: space.sm,
    fontSize: fontSize.xs,
    color: color.fgMuted,
    overflowWrap: "anywhere",
  },
  scaleRow: {
    display: "flex",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.sm,
  },
  scaleLabel: {
    flexShrink: 0,
    width: size.controlLg,
    fontSize: fontSize.sm,
    color: color.fgMuted,
  },
  scaleValue: {
    fontSize: fontSize.xs,
    color: color.fgMuted,
  },
  spacingBlock: (width: string) => ({
    backgroundColor: color.accentDefault,
    height: size.icon,
    width,
  }),
  controlBlock: (height: string) => ({
    boxSizing: "border-box",
    height,
    width: size.gridMin,
    maxWidth: "100%",
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderStrong,
    backgroundColor: color.bgSurfaceRaised,
  }),
  radiusRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.lg,
    alignItems: "center",
  },
  radiusBox: (borderRadius: string) => ({
    width: size.controlLg,
    height: size.controlLg,
    backgroundColor: color.bgSurfaceRaised,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderStrong,
    borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fontSize.xs,
    color: color.fgMuted,
  }),
  typeRow: (textSize: string, weight: string) => ({
    marginBottom: space.sm,
    fontSize: textSize,
    fontWeight: weight,
  }),
});

type Step = { name: string; value: string };

const colorSwatches: Step[] = [
  { name: "accentDefault", value: color.accentDefault },
  { name: "accentHover", value: color.accentHover },
  { name: "accentActive", value: color.accentActive },
  { name: "dangerDefault", value: color.dangerDefault },
  { name: "dangerHover", value: color.dangerHover },
  { name: "fgDanger", value: color.fgDanger },
  { name: "successDefault", value: color.successDefault },
  { name: "bgSurface", value: color.bgSurface },
  { name: "bgSurfaceRaised", value: color.bgSurfaceRaised },
];

const spacingScale: Step[] = [
  { name: "xxs", value: space.xxs },
  { name: "xs", value: space.xs },
  { name: "sm", value: space.sm },
  { name: "md", value: space.md },
  { name: "lg", value: space.lg },
  { name: "xl", value: space.xl },
  { name: "xxl", value: space.xxl },
  { name: "gutter", value: space.gutter },
];

const controlSizes: Step[] = [
  { name: "sm", value: size.controlSm },
  { name: "md", value: size.controlMd },
  { name: "lg", value: size.controlLg },
];

const radiusScale: Step[] = [
  { name: "sm", value: radius.sm },
  { name: "md", value: radius.md },
  { name: "lg", value: radius.lg },
  { name: "full", value: radius.full },
];

const typeScale: Step[] = [
  { name: "xs", value: fontSize.xs },
  { name: "sm", value: fontSize.sm },
  { name: "md", value: fontSize.md },
  { name: "lg", value: fontSize.lg },
  { name: "xl", value: fontSize.xl },
  { name: "xxl", value: fontSize.xxl },
];

const weightScale: Step[] = [
  { name: "regular", value: fontWeight.regular },
  { name: "medium", value: fontWeight.medium },
  { name: "semibold", value: fontWeight.semibold },
  { name: "bold", value: fontWeight.bold },
];

const motionScale: Step[] = [
  { name: "fast", value: motion.fast },
  { name: "medium", value: motion.medium },
  { name: "slow", value: motion.slow },
];

/**
 * Tokens compile to CSS custom properties; read the live value so the page
 * shows what this device actually resolves (e.g. touch control sizes).
 */
function resolveToken(value: string): string {
  const name = /var\((--[^),]+)/.exec(value)?.[1];
  if (!name) return value;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function ResolvedValue({ value }: { value: string }) {
  return (
    <span {...stylex.props(styles.scaleValue)}>{resolveToken(value)}</span>
  );
}

export function FoundationsPage() {
  return (
    <div>
      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Color</h2>
        <p {...stylex.props(styles.note)}>
          Semantic roles; each theme maps them to different primitives.
        </p>
        <div {...stylex.props(styles.swatchGrid)}>
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} {...stylex.props(styles.swatch)}>
              <div {...stylex.props(styles.swatchFill(swatch.value))} />
              <div {...stylex.props(styles.label)}>color.{swatch.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Spacing</h2>
        <p {...stylex.props(styles.note)}>
          A 4px-based scale. <code>gutter</code> is responsive: it tightens on
          phones.
        </p>
        {spacingScale.map((step) => (
          <div key={step.name} {...stylex.props(styles.scaleRow)}>
            <span {...stylex.props(styles.scaleLabel)}>{step.name}</span>
            <div {...stylex.props(styles.spacingBlock(step.value))} />
            <ResolvedValue value={step.value} />
          </div>
        ))}
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Control size</h2>
        <p {...stylex.props(styles.note)}>
          Shared by Button, TextField and Select. On touch screens, sm and md
          grow so tap targets meet the 44px guideline.
        </p>
        {controlSizes.map((step) => (
          <div key={step.name} {...stylex.props(styles.scaleRow)}>
            <span {...stylex.props(styles.scaleLabel)}>{step.name}</span>
            <div {...stylex.props(styles.controlBlock(step.value))} />
            <ResolvedValue value={step.value} />
          </div>
        ))}
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Radius</h2>
        <div {...stylex.props(styles.radiusRow)}>
          {radiusScale.map((step) => (
            <div key={step.name} {...stylex.props(styles.radiusBox(step.value))}>
              {step.name}
            </div>
          ))}
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Type scale</h2>
        {typeScale.map((step) => (
          <div
            key={step.name}
            {...stylex.props(styles.typeRow(step.value, fontWeight.regular))}
          >
            fontSize.{step.name} — The quick brown fox
          </div>
        ))}
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Font weight</h2>
        {weightScale.map((step) => (
          <div
            key={step.name}
            {...stylex.props(styles.typeRow(fontSize.lg, step.value))}
          >
            fontWeight.{step.name}
          </div>
        ))}
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Motion</h2>
        <p {...stylex.props(styles.note)}>
          Durations drop to 0ms when the OS asks for reduced motion, so every
          transition in the system respects it.
        </p>
        {motionScale.map((step) => (
          <div key={step.name} {...stylex.props(styles.scaleRow)}>
            <span {...stylex.props(styles.scaleLabel)}>{step.name}</span>
            <ResolvedValue value={step.value} />
          </div>
        ))}
      </section>
    </div>
  );
}
