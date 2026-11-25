import * as stylex from "@stylexjs/stylex";
import { contrastRatio, parseColor } from "@dsw/tokens/contrast";
import { ContrastAudit } from "./ContrastAudit";
// Primitives are imported here only to document the palette; components
// never consume them directly.
// eslint-disable-next-line @dsw/no-primitive-tokens -- documents the raw palette
import {
  bloomPalette,
  colorPrimitives,
  voltPalette,
} from "@dsw/tokens/primitives.stylex";
import { brands } from "@dsw/tokens/themes";
import { useTheme } from "@dsw/ui";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
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
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    marginTop: 0,
    marginBottom: space.xs,
  },
  ramp: {
    display: "grid",
    gridTemplateColumns: "repeat(11, minmax(0, 1fr))",
    gap: space.xxs,
    marginBottom: space.sm,
  },
  rampName: {
    marginBottom: space.xs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: color.fgMuted,
  },
  chip: (bg: string, fg: string) => ({
    display: "flex",
    alignItems: "flex-end",
    height: size.controlLg,
    paddingInline: space.xs,
    paddingBlock: space.xxs,
    borderRadius: radius.sm,
    // Hairline so the lightest steps stay visible against the canvas.
    boxShadow: `inset 0 0 0 ${borderWidth.thin} ${color.borderDefault}`,
    backgroundColor: bg,
    color: fg,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.mono,
  }),
  specimen: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    padding: space.xl,
    borderRadius: radius.xl,
    backgroundColor: color.bgSurface,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
  },
  specimenDisplay: {
    margin: 0,
    fontFamily: fontFamily.display,
    fontSize: { default: fontSize.display1, [breakpoints.mobile]: fontSize.display2 },
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.none,
    backgroundImage: `linear-gradient(100deg, ${color.fgGradientStart}, ${color.fgGradientEnd})`,
    backgroundClip: "text",
    color: "transparent",
  },
  specimenBody: {
    margin: 0,
    maxWidth: size.dialogMd,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.normal,
    color: color.fgMuted,
  },
  specimenMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.lg,
    fontSize: fontSize.xs,
    color: color.fgMuted,
  },
  metaFont: (family: string) => ({
    fontFamily: family,
    fontSize: fontSize.md,
    color: color.fgDefault,
  }),
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

const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const ramps = ["iris", "coral", "rose", "mint", "amber", "ink"] as const;
const rampValue = (family: string, step: number) =>
  (colorPrimitives as Record<string, string>)[`${family}${step}`] ?? "";

/**
 * Chip label: pure black or pure white, whichever contrasts more. One of
 * the two always reaches ≥4.58:1 against any colour, so this can never
 * fail 4.5:1. (A softer ink950 can: mint600 tops out at 4.3:1.)
 */
function labelFor(bg: string): string {
  const b = parseColor(bg);
  const light = parseColor(colorPrimitives.white);
  const dark = parseColor(colorPrimitives.black);
  if (!b || !light || !dark) return colorPrimitives.black;
  return contrastRatio(light, b) >= contrastRatio(dark, b)
    ? colorPrimitives.white
    : colorPrimitives.black;
}

const colorSwatches: Step[] = [
  { name: "accentDefault", value: color.accentDefault },
  { name: "accentHover", value: color.accentHover },
  { name: "accentActive", value: color.accentActive },
  { name: "fgAccent", value: color.fgAccent },
  { name: "bgAccentSubtle", value: color.bgAccentSubtle },
  { name: "dangerDefault", value: color.dangerDefault },
  { name: "dangerHover", value: color.dangerHover },
  { name: "fgDanger", value: color.fgDanger },
  { name: "successDefault", value: color.successDefault },
  { name: "bgCanvas", value: color.bgCanvas },
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

/** Volt and Bloom palettes are named colours rather than numbered ramps. */
const namedPalettes = { volt: voltPalette, bloom: bloomPalette } as const;

export function FoundationsPage() {
  const { brand } = useTheme();
  const info = brands.find((b) => b.id === brand) ?? brands[0]!;
  const named = brand === "iris" ? null : namedPalettes[brand];

  return (
    <div>
      <section {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.specimen)}>
          <p {...stylex.props(styles.specimenDisplay)}>Beautiful by default.</p>
          <p {...stylex.props(styles.specimenBody)}>
            {info.label}: {info.tagline.toLowerCase()}.{" "}
            {info.fonts.display === info.fonts.sans
              ? `${info.fonts.display} throughout`
              : `${info.fonts.display} for display, ${info.fonts.sans} for interface text`}{" "}
            and {info.fonts.mono} for code — self-hosted variable fonts, on a
            palette checked for contrast on every render.
          </p>
          <div {...stylex.props(styles.specimenMeta)}>
            <span>
              <span {...stylex.props(styles.metaFont(fontFamily.display))}>Aa</span>{" "}
              fontFamily.display
            </span>
            <span>
              <span {...stylex.props(styles.metaFont(fontFamily.sans))}>Aa</span>{" "}
              fontFamily.sans
            </span>
            <span>
              <span {...stylex.props(styles.metaFont(fontFamily.mono))}>Aa</span>{" "}
              fontFamily.mono
            </span>
          </div>
        </div>
      </section>

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.heading)}>Palette · {info.label}</h2>
        <p {...stylex.props(styles.note)}>
          {named
            ? "This brand's primitive colours. Components never use these directly; the brand theme maps them onto semantic and component tokens."
            : "Primitive ramps, generated in OKLCH so each step has the same perceived lightness across hues. Components never use these directly; they go through semantic and component tokens."}
        </p>
        {named && (
          <div {...stylex.props(styles.swatchGrid)}>
            {Object.entries(named).map(([name, hex]) => (
              <div key={name} {...stylex.props(styles.swatch)}>
                <div {...stylex.props(styles.chip(hex, labelFor(hex)))}>{hex}</div>
                <div {...stylex.props(styles.label)}>{name}</div>
              </div>
            ))}
          </div>
        )}
        {!named && ramps.map((family) => (
          <div key={family}>
            <div {...stylex.props(styles.rampName)}>{family}</div>
            <div {...stylex.props(styles.ramp)}>
              {RAMP_STEPS.map((step) => (
                <div
                  key={step}
                  title={`${family}${step} ${rampValue(family, step)}`}
                  {...stylex.props(
                    styles.chip(rampValue(family, step), labelFor(rampValue(family, step))),
                  )}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

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
        <h2 {...stylex.props(styles.heading)}>Contrast audit</h2>
        <p {...stylex.props(styles.note)}>
          Every colour pairing a component paints, resolved from the live
          theme. Switch themes and it re-measures. The same check runs in CI.
        </p>
        <ContrastAudit />
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
          Shared by Button, TextField and Select, the same on every device.
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
