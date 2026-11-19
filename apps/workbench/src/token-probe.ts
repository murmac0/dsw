/**
 * Token probe: a test fixture, loaded by main.tsx for `/?token-probe`.
 * Reads ?brand=&mode=,
 * applies exactly that theme to <html> the same way ThemeProvider does,
 * then resolves every exported token group to its computed value.
 */
import * as stylex from "@stylexjs/stylex";
import * as components from "@dsw/tokens/components.stylex";
import * as semantic from "@dsw/tokens/semantic.stylex";
import { themes } from "@dsw/tokens/themes";
import type { BrandName, ColorMode } from "@dsw/tokens";

const params = new URLSearchParams(location.search);
const brand = (params.get("brand") ?? "iris") as BrandName;
const mode = (params.get("mode") ?? "light") as ColorMode;

const className = stylex.props(themes[brand][mode]).className;
if (className) document.documentElement.classList.add(...className.split(" "));

const root = getComputedStyle(document.documentElement);
const values: Record<string, string> = {};
for (const [group, vars] of Object.entries({ ...semantic, ...components })) {
  if (!vars || typeof vars !== "object") continue;
  for (const [key, ref] of Object.entries(vars as Record<string, unknown>)) {
    const name = typeof ref === "string" ? /var\((--[^),\s]+)/.exec(ref)?.[1] : undefined;
    if (name) values[`${group}.${key}`] = root.getPropertyValue(name).trim();
  }
}

Object.assign(window, { __tokenValues: values });
document.body.dataset.ready = "true";
