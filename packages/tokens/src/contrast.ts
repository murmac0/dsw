import type { ContrastKind } from "./color-math";
import {
  alertTokens,
  badgeTokens,
  buttonTokens,
  cardTokens,
  codeTokens,
  dialogTokens,
  fieldsetTokens,
  fieldTokens,
  menuTokens,
  selectionTokens,
  switchTokens,
  linkTokens,
  tabsTokens,
  textTokens,
} from "./components.stylex";
import { color } from "./semantic.stylex";

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

  // Heading / Text
  pair("Text", "Heading on canvas", "text", textTokens.heading, color.bgCanvas),
  pair("Text", "Heading on surface", "text", textTokens.heading, color.bgSurface),
  pair("Text", "Text tone: body on surface", "text", textTokens.body, color.bgSurface),
  pair("Text", "Text tone: muted on surface", "text", textTokens.muted, color.bgSurface),
  pair("Text", "Text tone: accent on surface", "text", textTokens.accent, color.bgSurface),
  pair("Text", "Text tone: success on canvas", "text", textTokens.success, color.bgCanvas),
  pair("Text", "Text tone: warning on canvas", "text", textTokens.warning, color.bgCanvas),
  pair("Text", "Text tone: warning on surface", "text", textTokens.warning, color.bgSurface),
  pair("Text", "Text tone: danger on canvas", "text", textTokens.danger, color.bgCanvas),
  pair("Text", "Text tone: danger on surface", "text", textTokens.danger, color.bgSurface),

  // Link
  pair("Link", "Link on canvas", "text", linkTokens.fg, color.bgCanvas),
  pair("Link", "Link on surface", "text", linkTokens.fg, color.bgSurface),
  pair("Link", "Link, hover, on canvas", "text", linkTokens.fgHover, color.bgCanvas),
  pair("Link", "Link, hover, on surface", "text", linkTokens.fgHover, color.bgSurface),

  // Card: its content, including form controls placed inside it
  pair("Card", "Heading on card", "text", textTokens.heading, cardTokens.bg),
  pair("Card", "Muted text on card", "text", textTokens.muted, cardTokens.bg),
  pair("Card", "Link on card", "text", linkTokens.fg, cardTokens.bg),
  pair("Card", "Field border on card", "ui", fieldTokens.border, cardTokens.bg),
  pair("Card", "Checkbox border on card", "ui", selectionTokens.border, cardTokens.bg),
  pair("Card", "Switch off edge on card", "ui", switchTokens.trackOffEdge, cardTokens.bg),
  pair("Card", "Field label on card", "text", fieldTokens.label, cardTokens.bg),

  // Badge
  pair("Badge", "Neutral", "text", badgeTokens.neutralFg, badgeTokens.neutralBg),
  pair("Badge", "Accent", "text", badgeTokens.accentFg, badgeTokens.accentBg),
  pair("Badge", "Success", "text", badgeTokens.successFg, badgeTokens.successBg),
  pair("Badge", "Warning", "text", badgeTokens.warningFg, badgeTokens.warningBg),
  pair("Badge", "Danger", "text", badgeTokens.dangerFg, badgeTokens.dangerBg),

  // CodeBlock
  pair("CodeBlock", "Code", "text", codeTokens.text, codeTokens.bg),
  pair("CodeBlock", "File name and copy label", "text", codeTokens.label, codeTokens.bg),
  pair("CodeBlock", "Comment", "text", codeTokens.comment, codeTokens.bg),
  pair("CodeBlock", "Keyword", "text", codeTokens.keyword, codeTokens.bg),
  pair("CodeBlock", "String", "text", codeTokens.string, codeTokens.bg),
  pair("CodeBlock", "Name", "text", codeTokens.name, codeTokens.bg),
  pair("CodeBlock", "Attribute", "text", codeTokens.attribute, codeTokens.bg),

  // Alert
  pair("Alert", "Info text", "text", alertTokens.fg, alertTokens.infoBg),
  pair("Alert", "Info icon", "ui", alertTokens.infoIcon, alertTokens.infoBg),
  pair("Alert", "Success text", "text", alertTokens.fg, alertTokens.successBg),
  pair("Alert", "Success icon", "ui", alertTokens.successIcon, alertTokens.successBg),
  pair("Alert", "Warning text", "text", alertTokens.fg, alertTokens.warningBg),
  pair("Alert", "Warning icon", "ui", alertTokens.warningIcon, alertTokens.warningBg),
  pair("Alert", "Danger text", "text", alertTokens.fg, alertTokens.dangerBg),
  pair("Alert", "Danger icon", "ui", alertTokens.dangerIcon, alertTokens.dangerBg),
  // Links inside alerts sit on the wash.
  pair("Alert", "Link on info", "text", linkTokens.fg, alertTokens.infoBg),
  pair("Alert", "Link on warning", "text", linkTokens.fg, alertTokens.warningBg),

  // Tabs
  pair("Tabs", "Tab on canvas", "text", tabsTokens.fg, color.bgCanvas),
  pair("Tabs", "Tab on surface", "text", tabsTokens.fg, color.bgSurface),
  pair("Tabs", "Tab, hover", "text", tabsTokens.fgHover, tabsTokens.bgHover),
  pair("Tabs", "Selected tab on canvas", "text", tabsTokens.fgSelected, color.bgCanvas),
  pair("Tabs", "Selected tab on surface", "text", tabsTokens.fgSelected, color.bgSurface),
  pair("Tabs", "Indicator vs canvas", "ui", tabsTokens.indicator, color.bgCanvas),
  pair("Tabs", "Indicator vs surface", "ui", tabsTokens.indicator, color.bgSurface),
];


export { AA, contrastRatio, parseColor, relativeLuminance } from "./color-math";
export type { ContrastKind, RGB } from "./color-math";
