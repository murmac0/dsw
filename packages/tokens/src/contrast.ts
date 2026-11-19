import {
  buttonTokens,
  dialogTokens,
  fieldsetTokens,
  fieldTokens,
  menuTokens,
  selectionTokens,
  switchTokens,
} from "./components.stylex";
import { color } from "./semantic.stylex";

/**
 * WCAG 2.2 AA thresholds.
 * - text: 1.4.3 Contrast (Minimum), normal-size text.
 * - ui:   1.4.11 Non-text Contrast: control boundaries, state indicators,
 *         focus rings and meaningful graphics against adjacent colours.
 * Disabled controls are exempt under both criteria and aren't listed.
 */
export const AA = { text: 4.5, ui: 3 } as const;
export type ContrastKind = keyof typeof AA;

export interface ContrastPair {
  component: string;
  /** What this pairing is on screen. */
  usage: string;
  kind: ContrastKind;
  /** Token values as shipped (CSS var references); resolved in the browser. */
  fg: string;
  bg: string;
}

const pair = (
  component: string,
  usage: string,
  kind: ContrastKind,
  fg: string,
  bg: string,
): ContrastPair => ({ component, usage, kind, fg, bg });

/**
 * Every colour pairing the system ships, at the component-token level:
 * the values components actually paint, after theme overrides. Checked
 * live in each theme by the Foundations contrast audit and its E2E test,
 * so adding a component means adding its pairs here.
 *
 * Form controls are specified for `bgCanvas` and `bgSurface`;
 * `bgSurfaceRaised` is for chrome (secondary buttons, code panels), not
 * as a backdrop for inputs.
 */
export const contrastPairs: readonly ContrastPair[] = [
  // Foundations
  pair("Text", "Body on canvas", "text", color.fgDefault, color.bgCanvas),
  pair("Text", "Body on surface", "text", color.fgDefault, color.bgSurface),
  pair("Text", "Body on raised", "text", color.fgDefault, color.bgSurfaceRaised),
  pair("Text", "Muted on canvas", "text", color.fgMuted, color.bgCanvas),
  pair("Text", "Muted on surface", "text", color.fgMuted, color.bgSurface),
  pair("Text", "Muted on raised", "text", color.fgMuted, color.bgSurfaceRaised),
  pair("Text", "Accent on canvas", "text", color.fgAccent, color.bgCanvas),
  pair("Text", "Accent on surface", "text", color.fgAccent, color.bgSurface),
  pair("Text", "Success on surface", "text", color.fgSuccess, color.bgSurface),
  pair("Text", "Gradient start on canvas", "text", color.fgGradientStart, color.bgCanvas),
  pair("Text", "Gradient end on canvas", "text", color.fgGradientEnd, color.bgCanvas),
  pair("Text", "Gradient start on surface", "text", color.fgGradientStart, color.bgSurface),
  pair("Text", "Gradient end on surface", "text", color.fgGradientEnd, color.bgSurface),
  pair("Focus", "Focus ring on canvas", "ui", color.borderFocus, color.bgCanvas),
  pair("Focus", "Focus ring on surface", "ui", color.borderFocus, color.bgSurface),

  // Button
  pair("Button", "Primary label", "text", buttonTokens.primaryFg, buttonTokens.primaryBg),
  pair("Button", "Primary label, hover", "text", buttonTokens.primaryFg, buttonTokens.primaryBgHover),
  pair("Button", "Primary label, pressed", "text", buttonTokens.primaryFg, buttonTokens.primaryBgPressed),
  pair("Button", "Secondary label", "text", buttonTokens.secondaryFg, buttonTokens.secondaryBg),
  pair("Button", "Secondary label, hover", "text", buttonTokens.secondaryFg, buttonTokens.secondaryBgHover),
  pair("Button", "Ghost label on canvas", "text", buttonTokens.ghostFg, color.bgCanvas),
  pair("Button", "Ghost label, hover", "text", buttonTokens.ghostFg, buttonTokens.ghostBgHover),
  pair("Button", "Danger label", "text", buttonTokens.dangerFg, buttonTokens.dangerBg),
  pair("Button", "Danger label, hover", "text", buttonTokens.dangerFg, buttonTokens.dangerBgHover),

  // TextField / Select trigger
  pair("Field", "Value", "text", fieldTokens.fg, fieldTokens.bg),
  pair("Field", "Placeholder", "text", fieldTokens.placeholder, fieldTokens.bg),
  pair("Field", "Label on canvas", "text", fieldTokens.label, color.bgCanvas),
  pair("Field", "Description on canvas", "text", fieldTokens.description, color.bgCanvas),
  pair("Field", "Description on surface", "text", fieldTokens.description, color.bgSurface),
  pair("Field", "Error on canvas", "text", fieldTokens.error, color.bgCanvas),
  pair("Field", "Error on surface", "text", fieldTokens.error, color.bgSurface),
  pair("Field", "Border vs field", "ui", fieldTokens.border, fieldTokens.bg),
  pair("Field", "Border vs canvas", "ui", fieldTokens.border, color.bgCanvas),
  pair("Field", "Invalid border", "ui", fieldTokens.borderInvalid, fieldTokens.bg),
  pair("Field", "Focus border", "ui", fieldTokens.borderFocus, fieldTokens.bg),
  pair("Field", "Chevron icon", "ui", fieldTokens.icon, fieldTokens.bg),

  // Fieldset (plain on canvas; boxed on its own bg)
  pair("Fieldset", "Legend on canvas", "text", fieldsetTokens.legend, color.bgCanvas),
  pair("Fieldset", "Legend, boxed", "text", fieldsetTokens.legend, fieldsetTokens.bg),
  pair("Fieldset", "Description on canvas", "text", fieldsetTokens.description, color.bgCanvas),
  pair("Fieldset", "Description, boxed", "text", fieldsetTokens.description, fieldsetTokens.bg),
  pair("Fieldset", "Group error on canvas", "text", fieldsetTokens.error, color.bgCanvas),
  pair("Fieldset", "Group error, boxed", "text", fieldsetTokens.error, fieldsetTokens.bg),
  // Form controls also sit on a boxed fieldset's background.
  pair("Fieldset", "Field border, boxed", "ui", fieldTokens.border, fieldsetTokens.bg),
  pair("Fieldset", "Checkbox border, boxed", "ui", selectionTokens.border, fieldsetTokens.bg),

  // Checkbox / Radio
  pair("Selection", "Label on canvas", "text", selectionTokens.label, color.bgCanvas),
  pair("Selection", "Label on surface", "text", selectionTokens.label, color.bgSurface),
  pair("Selection", "Box border vs canvas", "ui", selectionTokens.border, color.bgCanvas),
  pair("Selection", "Box border vs surface", "ui", selectionTokens.border, color.bgSurface),
  // The checked box's boundary (outline, or the fill when they match).
  pair("Selection", "Checked box edge vs surface", "ui", selectionTokens.checkedBorder, color.bgSurface),
  pair("Selection", "Check mark", "ui", selectionTokens.mark, selectionTokens.checkedBg),
  pair("Selection", "Check mark, hover", "ui", selectionTokens.mark, selectionTokens.checkedBgHover),

  // Switch
  pair("Switch", "Label on surface", "text", switchTokens.label, color.bgSurface),
  // Track edges: an outline where a brand draws one, else the fill itself
  // (edge tokens must then equal the fill — see components.stylex.ts).
  pair("Switch", "Off track edge vs surface", "ui", switchTokens.trackOffEdge, color.bgSurface),
  pair("Switch", "Off track edge vs canvas", "ui", switchTokens.trackOffEdge, color.bgCanvas),
  pair("Switch", "On track edge vs surface", "ui", switchTokens.trackOnEdge, color.bgSurface),
  pair("Switch", "Thumb on off track", "ui", switchTokens.thumb, switchTokens.trackOff),
  pair("Switch", "Thumb on off track, hover", "ui", switchTokens.thumb, switchTokens.trackOffHover),
  pair("Switch", "Thumb on on track", "ui", switchTokens.thumbOn, switchTokens.trackOn),
  pair("Switch", "Thumb on on track, hover", "ui", switchTokens.thumbOn, switchTokens.trackOnHover),

  // Select menu
  pair("Menu", "Item", "text", menuTokens.itemFg, menuTokens.bg),
  pair("Menu", "Item, hover", "text", menuTokens.itemFg, menuTokens.itemBgHover),
  pair("Menu", "Selected item", "text", menuTokens.itemFgSelected, menuTokens.itemBgSelected),
  pair("Menu", "Selected item, hover", "text", menuTokens.itemFgSelected, menuTokens.itemBgHover),
  pair("Menu", "Check icon", "ui", menuTokens.check, menuTokens.itemBgSelected),

  // Dialog
  pair("Dialog", "Title", "text", dialogTokens.title, dialogTokens.bg),
  pair("Dialog", "Body", "text", dialogTokens.body, dialogTokens.bg),
];

type RGB = readonly [number, number, number];

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
