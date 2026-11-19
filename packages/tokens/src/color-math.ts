/**
 * Pure colour maths (WCAG contrast). No StyleX imports, so it can run
 * anywhere: the browser audit, Node scripts, the MCP server.
 */

/**
 * WCAG 2.2 AA thresholds.
 * - text: 1.4.3 Contrast (Minimum), normal-size text.
 * - ui:   1.4.11 Non-text Contrast: control boundaries, state indicators,
 *         focus rings and meaningful graphics against adjacent colours.
 * Disabled controls are exempt under both criteria and aren't listed.
 */
export const AA = { text: 4.5, ui: 3 } as const;
export type ContrastKind = keyof typeof AA;

export type RGB = readonly [number, number, number];

/** Parses the formats getComputedStyle returns: rgb()/rgba() and hex. */
export function parseColor(value: string): RGB | null {
  const v = value.trim();
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex?.[1]) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as unknown as RGB;
  }
  return null;
}

/** WCAG relative luminance. */
export function relativeLuminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, 1–21. */
export function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}
