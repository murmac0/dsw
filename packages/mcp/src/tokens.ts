import { AA, contrastRatio, parseColor, type RGB } from "@dsw/tokens/color-math";
import { DEFAULT_THEME, tokenByRef, tokens, type TokenEntry } from "./data.ts";

export function assertTheme(theme: string): string {
  if (!tokens.themes.includes(theme)) {
    throw new Error(`Unknown theme "${theme}". Use one of: ${tokens.themes.join(", ")}`);
  }
  return theme;
}

/** "color.fgMuted = #5e5e70  (@dsw/tokens/semantic.stylex) — description" */
export function tokenLine(t: TokenEntry, theme: string): string {
  const desc = t.description ? ` — ${t.description}` : "";
  return `${t.ref} = ${t.values[theme]}${desc}`;
}

export function searchTokens(opts: {
  query?: string | undefined;
  group?: string | undefined;
  tier?: "semantic" | "component" | undefined;
  component?: string | undefined;
}): TokenEntry[] {
  const words = (opts.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.tokens.filter((t) => {
    if (opts.group && t.group !== opts.group) return false;
    if (opts.tier && t.tier !== opts.tier) return false;
    if (opts.component && !t.component?.toLowerCase().includes(opts.component.toLowerCase())) return false;
    const hay = `${t.ref} ${t.description ?? ""} ${t.component ?? ""} ${t.type ?? ""}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/* ------------------------------------------------------------------ */
/* Value → token                                                       */
/* ------------------------------------------------------------------ */

/** Token groups that suit a CSS property, most specific first. */
const GROUPS_FOR_PROPERTY: Array<[RegExp, string[]]> = [
  [/^(padding|margin|gap|rowGap|columnGap|inset|top|left|right|bottom)/i, ["space"]],
  [/(width|height|size)$/i, ["size", "space"]],
  [/radius/i, ["radius"]],
  [/borderWidth|outlineWidth|outlineOffset/i, ["borderWidth", "focus"]],
  [/fontSize/i, ["fontSize"]],
  [/fontWeight/i, ["fontWeight"]],
  [/lineHeight/i, ["lineHeight"]],
  [/letterSpacing/i, ["letterSpacing"]],
  [/fontFamily/i, ["fontFamily"]],
  [/(duration|delay)/i, ["motion"]],
  [/timingFunction/i, ["motion"]],
  [/opacity/i, ["opacity"]],
  [/zIndex/i, ["zIndex"]],
  [/shadow/i, ["shadow"]],
  [/^(color|fill|stroke)$/i, ["color"]],
  [/background/i, ["color"]],
  [/border.*color|outlineColor/i, ["color"]],
];

function groupsFor(property: string | undefined): string[] | undefined {
  if (!property) return undefined;
  return GROUPS_FOR_PROPERTY.find(([re]) => re.test(property))?.[1];
}

const toPx = (v: string): number | undefined => {
  const m = /^(-?[\d.]+)(px|rem)?$/.exec(v.trim());
  if (!m) return undefined;
  return m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1]);
};
const toMs = (v: string): number | undefined => {
  const m = /^([\d.]+)(ms|s)$/.exec(v.trim());
  return m ? Number(m[1]) * (m[2] === "s" ? 1000 : 1) : undefined;
};

export interface Suggestion {
  token: TokenEntry;
  value: string;
  exact: boolean;
  note?: string;
}

/**
 * Tokens for a hardcoded value, exact matches first. Colours compare as sRGB
 * (distance for near-misses); lengths in px; durations in ms; plain
 * numbers by property. Semantic tokens rank above component tokens, and
 * decorative `brand.*` colours are flagged.
 */
export function findTokens(
  raw: string,
  opts: { theme?: string | undefined; property?: string | undefined; limit?: number | undefined } = {},
): Suggestion[] {
  const theme = assertTheme(opts.theme ?? DEFAULT_THEME);
  const value = raw.trim().replace(/^"|"$/g, "");
  const preferred = groupsFor(opts.property);
  const limit = opts.limit ?? 5;

  // With a known property, stay in matching groups: padding → space, not a
  // corner radius that happens to share the value. Colour properties may
  // also use component colour tokens (fieldTokens.placeholder, …).
  const colourProperty = preferred?.includes("color") ?? false;
  const pool = tokens.tokens.filter(
    (t) =>
      !preferred ||
      preferred.includes(t.group) ||
      (colourProperty && t.tier === "component" && /Tokens$/.test(t.group)),
  );
  // Among equal values, prefer names that fit the property's intent.
  const intent = (t: TokenEntry): number => {
    if (!opts.property) return 0;
    const k = t.key;
    if (/^(color|fill|stroke)$/i.test(opts.property)) return /^fg|Fg$|label|text|mark|icon/.test(k) ? 0 : 1;
    if (/background/i.test(opts.property)) return /^bg|Bg$|^accent|^danger|^success|track|thumb/.test(k) ? 0 : 1;
    if (/border|outline/i.test(opts.property)) return /border|Border|focus|Focus|edge|Edge/.test(k) ? 0 : 1;
    return 0;
  };
  // Source tokens before the aliases that point at them.
  const rank = (t: TokenEntry) =>
    intent(t) * 4 + (t.tier === "semantic" ? 0 : 2) + (t.alias?.[theme] ? 1 : 0);

  const rgb = parseColor(value);
  if (rgb) {
    const scored = pool
      .map((t) => {
        const c = parseColor(t.values[theme] ?? "");
        return c ? { t, d: Math.hypot(c[0] - rgb[0], c[1] - rgb[1], c[2] - rgb[2]) } : undefined;
      })
      .filter((x): x is { t: TokenEntry; d: number } => !!x)
      .sort((a, b) => a.d - b.d || rank(a.t) - rank(b.t));
    return scored.slice(0, limit).map(({ t, d }) => ({
      token: t,
      value: t.values[theme] ?? "",
      exact: d === 0,
      ...(t.group === "brand" && { note: "decorative only: never for text or control boundaries" }),
      ...(d > 0 && { note: `nearest colour (sRGB distance ${d.toFixed(0)})` }),
    }));
  }

  const px = toPx(value);
  const ms = toMs(value);
  const num = /^-?[\d.]+$/.test(value) ? Number(value) : undefined;
  const scored = pool
    .map((t) => {
      const v = t.values[theme] ?? "";
      let d: number | undefined;
      if (ms !== undefined) {
        const tv = toMs(v);
        if (tv !== undefined) d = Math.abs(tv - ms);
      } else if (px !== undefined && num === undefined) {
        const tv = toPx(v);
        if (tv !== undefined && /px|rem/.test(v)) d = Math.abs(tv - px);
      } else if (num !== undefined) {
        if (/^-?[\d.]+$/.test(v)) d = Math.abs(Number(v) - num);
        else if (preferred?.some((g) => ["space", "size", "radius", "borderWidth", "fontSize"].includes(g))) {
          const tv = toPx(v);
          if (tv !== undefined) d = Math.abs(tv - num);
        }
      } else if (v.replace(/\s+/g, " ") === value.replace(/\s+/g, " ")) {
        d = 0;
      }
      return d === undefined ? undefined : { t, d };
    })
    .filter((x): x is { t: TokenEntry; d: number } => !!x)
    .sort((a, b) => a.d - b.d || rank(a.t) - rank(b.t));
  return scored.slice(0, limit).map(({ t, d }) => ({
    token: t,
    value: t.values[theme] ?? "",
    exact: d === 0,
    ...(d > 0 && { note: `nearest (off by ${+d.toFixed(3)})` }),
  }));
}

/* ------------------------------------------------------------------ */
/* Contrast                                                            */
/* ------------------------------------------------------------------ */

/** A colour literal, or a token ref resolved in the given theme. */
export function resolveColor(input: string, theme: string): { rgb: RGB; label: string } {
  const t = tokenByRef.get(input.trim());
  const raw = t ? (t.values[theme] ?? "") : input;
  const rgb = parseColor(raw);
  if (!rgb) {
    throw new Error(
      t
        ? `${input} isn't a solid colour in ${theme} (value: ${raw}).`
        : `"${input}" isn't a token ref or a hex/rgb() colour.`,
    );
  }
  return { rgb, label: t ? `${input} (${raw})` : raw };
}

export function contrastReport(fg: string, bg: string, themes: string[]) {
  const audited = tokens.contrast.filter((p) => p.fg === fg.trim() && p.bg === bg.trim());
  const rows = themes.map((theme) => {
    const a = resolveColor(fg, theme);
    const b = resolveColor(bg, theme);
    const ratio = contrastRatio(a.rgb, b.rgb);
    return {
      theme,
      fg: a.label,
      bg: b.label,
      ratio: +ratio.toFixed(2),
      text: ratio >= AA.text,
      ui: ratio >= AA.ui,
    };
  });
  return { rows, audited };
}
