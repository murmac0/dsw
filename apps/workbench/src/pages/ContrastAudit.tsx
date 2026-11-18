import * as stylex from "@stylexjs/stylex";
import { useMemo, useSyncExternalStore } from "react";
import {
  AA,
  contrastPairs,
  contrastRatio,
  parseColor,
  type ContrastPair,
} from "@dsw/tokens/contrast";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  summary: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.lg,
    fontSize: fontSize.sm,
    color: color.fgMuted,
  },
  group: {
    marginBottom: space.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurface,
    overflow: "hidden",
  },
  groupTitle: {
    margin: 0,
    paddingBlock: space.sm,
    paddingInline: space.md,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: color.fgMuted,
    backgroundColor: color.bgSurfaceRaised,
  },
  row: {
    display: "grid",
    gridTemplateColumns: `${size.controlLg} minmax(0, 1fr) auto auto`,
    alignItems: "center",
    columnGap: { default: space.md, [breakpoints.mobile]: space.sm },
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderTopWidth: borderWidth.thin,
    borderTopStyle: "solid",
    borderTopColor: color.borderDefault,
    fontSize: fontSize.sm,
  },
  sample: (fg: string, bg: string) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: size.controlSm,
    borderRadius: radius.sm,
    color: fg,
    backgroundColor: bg,
    fontWeight: fontWeight.semibold,
  }),
  uiSample: (fg: string) => ({
    width: size.icon,
    height: size.icon,
    borderRadius: radius.full,
    backgroundColor: fg,
  }),
  usage: {
    color: color.fgDefault,
  },
  requirement: {
    fontSize: fontSize.xs,
    color: color.fgMuted,
    display: { default: "block", [breakpoints.mobile]: "none" },
  },
  ratio: {
    fontFamily: fontFamily.mono,
    fontVariantNumeric: "tabular-nums",
    textAlign: "end",
    color: color.fgDefault,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    paddingBlock: space.xxs,
    paddingInline: space.sm,
    borderRadius: radius.full,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: color.fgSuccess,
    backgroundColor: color.bgSurfaceRaised,
  },
  badgeFail: {
    color: color.fgDanger,
  },
});

interface Result extends ContrastPair {
  ratio: number;
  pass: boolean;
}

/** Re-render whenever the theme class on <html> changes. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getThemeKey = () => document.documentElement.className;

/**
 * Resolves each token through a probe element, so the ratio is computed
 * from the colour the browser actually paints in the current theme —
 * after aliasing and theme overrides — not from a spreadsheet.
 */
function audit(): Result[] {
  const probe = document.createElement("span");
  document.body.append(probe);
  const resolve = (value: string) => {
    probe.style.color = value;
    return parseColor(getComputedStyle(probe).color);
  };
  const results = contrastPairs.map((p) => {
    const fg = resolve(p.fg);
    const bg = resolve(p.bg);
    const ratio = fg && bg ? contrastRatio(fg, bg) : 0;
    return { ...p, ratio, pass: ratio >= AA[p.kind] };
  });
  probe.remove();
  return results;
}

export function ContrastAudit() {
  const themeKey = useSyncExternalStore(subscribe, getThemeKey);
  // themeKey is the trigger: recompute when the theme changes.
  const { results } = useMemo(
    () => ({ theme: themeKey, results: audit() }),
    [themeKey],
  );

  const failing = results.filter((r) => !r.pass).length;
  const groups = [...new Set(results.map((r) => r.component))];

  return (
    <div data-testid="contrast-audit" data-failing={failing}>
      <p {...stylex.props(styles.summary)} role="status">
        <span {...stylex.props(styles.badge, failing > 0 && styles.badgeFail)}>
          {failing === 0 ? "✓ All pass AA" : `✕ ${failing} failing`}
        </span>
        {results.length} pairings, measured live in this theme. Text needs {AA.text}:1; control boundaries,
        indicators and focus rings need {AA.ui}:1.
      </p>
      {groups.map((group) => (
        <div key={group} {...stylex.props(styles.group)}>
          <h3 {...stylex.props(styles.groupTitle)}>{group}</h3>
          {results
            .filter((r) => r.component === group)
            .map((r) => (
              <div
                key={r.usage}
                {...stylex.props(styles.row)}
                data-testid="contrast-row"
                data-pass={r.pass}
                data-ratio={r.ratio.toFixed(2)}
              >
                <div {...stylex.props(styles.sample(r.fg, r.bg))} aria-hidden="true">
                  {r.kind === "text" ? "Aa" : <span {...stylex.props(styles.uiSample(r.fg))} />}
                </div>
                <div>
                  <div {...stylex.props(styles.usage)}>{r.usage}</div>
                  <div {...stylex.props(styles.requirement)}>
                    {r.kind === "text" ? "Text" : "Non-text"} · needs {AA[r.kind]}:1
                  </div>
                </div>
                <div {...stylex.props(styles.ratio)}>{r.ratio.toFixed(2)}:1</div>
                <span
                  {...stylex.props(styles.badge, !r.pass && styles.badgeFail)}
                  aria-label={r.pass ? "Passes AA" : "Fails AA"}
                >
                  {r.pass ? "AA" : "Fail"}
                </span>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
