import * as stylex from "@stylexjs/stylex";
import { useEffect, type ComponentType } from "react";
import type { BrandName, ColorMode } from "@dsw/tokens";
import { brands } from "@dsw/tokens/themes";
import { space } from "@dsw/tokens/semantic.stylex";
import { SettingsPage } from "./pages/SettingsPage";

/**
 * Bare pages for <iframe> previews at a set width: `#/frame/<name>?brand=&mode=`.
 * Breakpoints follow the window, so only a frame of a given width shows a
 * page's real phone or tablet layout. No header or sidebar, and the theme
 * comes from the URL so the frame matches the page around it.
 */
const FRAMES: Record<string, { title: string; Page: ComponentType }> = {
  "settings-page": { title: "Settings page preview", Page: SettingsPage },
};

const styles = stylex.create({
  main: { padding: space.gutter },
});

export interface FrameRequest {
  name: string;
  brand: BrandName;
  theme: ColorMode;
}

export function parseFrame(hash: string): FrameRequest | null {
  const match = /^#\/frame\/([\w-]+)(?:\?(.*))?$/.exec(hash);
  if (!match?.[1] || !(match[1] in FRAMES)) return null;
  const params = new URLSearchParams(match[2] ?? "");
  const brand = brands.find((b) => b.id === params.get("brand"))?.id ?? "iris";
  const theme: ColorMode = params.get("mode") === "dark" ? "dark" : "light";
  return { name: match[1], brand, theme };
}

export const frameUrl = (name: string, brand: BrandName, theme: ColorMode) =>
  `#/frame/${name}?brand=${brand}&mode=${theme}`;

export function Frame({ name }: { name: string }) {
  const frame = FRAMES[name]!;
  useEffect(() => {
    document.title = frame.title;
  }, [frame.title]);
  return (
    <main {...stylex.props(styles.main)}>
      <frame.Page />
    </main>
  );
}
