import * as stylex from "@stylexjs/stylex";
import { colorPrimitives } from "../primitives.stylex";
import { color } from "../semantic.stylex";

/**
 * Dark theme: overrides the same semantic contract defined in
 * semantic.stylex.ts. Adding a future brand theme means adding one
 * more file like this one — no component changes required.
 */
export const darkTheme = stylex.createTheme(color, {
  bgCanvas: colorPrimitives.gray900,
  bgSurface: colorPrimitives.gray800,
  bgSurfaceRaised: colorPrimitives.gray700,
  bgOverlay: "rgba(0, 0, 0, 0.6)",

  fgDefault: colorPrimitives.gray50,
  fgMuted: colorPrimitives.gray300,
  fgOnAccent: colorPrimitives.white,
  fgDisabled: colorPrimitives.gray600,

  borderDefault: colorPrimitives.gray700,
  borderStrong: colorPrimitives.gray600,
  borderFocus: colorPrimitives.blue400,

  accentDefault: colorPrimitives.blue400,
  accentHover: colorPrimitives.blue500,
  accentActive: colorPrimitives.blue600,
  accentDisabled: colorPrimitives.gray700,

  dangerDefault: colorPrimitives.red400,
  dangerHover: colorPrimitives.red500,
  fgDanger: colorPrimitives.red400,

  successDefault: colorPrimitives.green400,
});
