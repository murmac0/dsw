import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/**
 * The token export (packages/tokens/generated/tokens.json) is produced by
 * static analysis of the StyleX sources. This checks it against reality:
 * every token, in every brand × mode, must equal what the browser computes
 * from the compiled CSS. If the exporter mis-resolves an alias, a theme
 * override or a template value, this fails.
 */
interface Manifest {
  themes: string[];
  tokens: Array<{ ref: string; values: Record<string, string> }>;
}
const manifest = JSON.parse(
  readFileSync(new URL("../../../packages/tokens/generated/tokens.json", import.meta.url), "utf8"),
) as Manifest;

for (const theme of manifest.themes) {
  test(`token export matches the browser — ${theme}`, async ({ page }) => {
    const [brand, mode] = theme.split("/");
    await page.goto(`/?token-probe&brand=${brand}&mode=${mode}`);
    await expect(page.locator("body")).toHaveAttribute("data-ready", "true");

    const expected = Object.fromEntries(manifest.tokens.map((t) => [t.ref, t.values[theme] ?? ""]));
    const mismatches = await page.evaluate((exp) => {
      const actual = (window as unknown as { __tokenValues: Record<string, string> }).__tokenValues;
      const probe = document.createElement("span");
      document.body.append(probe);
      // Normalise both sides through the browser's own CSS parser, so
      // equivalent spellings compare equal: "#FFF" / "rgb(255, 255, 255)",
      // and StyleX's minified "-.02em" / ".12s" vs source "-0.02em" / "120ms".
      // The first property that accepts the value decides how it's compared.
      // font-weight precedes opacity: opacity clamps any number to 1, which
      // would make 600 and 700 compare equal; it only gets values in 0–1.
      const props = [
        "color",
        "box-shadow",
        "transition-duration",
        "transition-timing-function",
        "transform",
        "letter-spacing",
        "font-weight",
        "opacity",
      ];
      const norm = (v: string) => {
        for (const prop of props) {
          probe.style.cssText = "";
          probe.style.setProperty(prop, v);
          if (probe.style.getPropertyValue(prop)) {
            return `${prop}:${getComputedStyle(probe).getPropertyValue(prop)}`;
          }
        }
        return v.replace(/\s+/g, " ").trim();
      };
      const out: string[] = [];
      for (const [ref, want] of Object.entries(exp)) {
        if (!(ref in actual)) out.push(`${ref}: missing in browser`);
        else if (norm(actual[ref]!) !== norm(want)) out.push(`${ref}: export "${want}" ≠ browser "${actual[ref]}"`);
      }
      for (const ref of Object.keys(actual)) if (!(ref in exp)) out.push(`${ref}: missing in export`);
      return out;
    }, expected);

    expect(mismatches, mismatches.join("\n")).toEqual([]);
  });
}
