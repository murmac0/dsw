import { bloomTheme } from "./bloom";
import { darkTheme } from "./dark";
import { voltTheme } from "./volt";

export type ColorMode = "light" | "dark";

/**
 * Every brand × mode combination as a list of StyleX themes. Apply exactly
 * one entry to <html>:
 *
 *   stylex.props(themes[brand][mode])
 *
 * Each list is complete for its combination: a brand's dark list repeats
 * its shape/type themes rather than relying on another list also being
 * applied, because two createTheme() overrides of the same token group on
 * one element have no defined winner.
 */
export const themes = {
  iris: { light: [], dark: darkTheme },
  volt: voltTheme,
  bloom: bloomTheme,
} as const;

export type BrandName = keyof typeof themes;

export interface BrandInfo {
  id: BrandName;
  label: string;
  tagline: string;
  fonts: { display: string; sans: string; mono: string };
}

export const brands: readonly BrandInfo[] = [
  {
    id: "iris",
    label: "Iris",
    tagline: "Electric violet, soft geometry",
    fonts: { display: "Bricolage Grotesque", sans: "Geist", mono: "Geist Mono" },
  },
  {
    id: "volt",
    label: "Volt",
    tagline: "Neo-brutalist, acid lime",
    fonts: { display: "Space Grotesk", sans: "Space Grotesk", mono: "JetBrains Mono" },
  },
  {
    id: "bloom",
    label: "Bloom",
    tagline: "Editorial serif, forest & clay",
    fonts: { display: "Fraunces", sans: "Instrument Sans", mono: "Geist Mono" },
  },
];
