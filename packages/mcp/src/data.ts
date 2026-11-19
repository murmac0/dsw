/**
 * Loads the generated design-system manifests and docs once, at startup.
 * Nothing here imports StyleX token modules: those only run inside the
 * StyleX compiler. The manifests are produced from them statically and
 * checked against the browser in CI (e2e/token-export.spec.ts).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface TokenEntry {
  ref: string;
  group: string;
  key: string;
  tier: "semantic" | "component";
  component?: string;
  import: string;
  description?: string;
  type?: string;
  alias?: Record<string, string>;
  values: Record<string, string>;
  conditions?: Record<string, Record<string, string>>;
}

export interface ContrastEntry {
  component: string;
  usage: string;
  kind: "text" | "ui";
  min: number;
  fg: string;
  bg: string;
  ratios: Record<string, number>;
  pass: boolean;
}

export interface BrandEntry {
  id: string;
  label: string;
  tagline: string;
  fonts: { display: string; sans: string; mono: string };
}

export interface TokenManifest {
  themes: string[];
  brands: BrandEntry[];
  breakpoints: Record<string, string>;
  groups: Array<{
    name: string;
    tier: string;
    import: string;
    component?: string;
    description?: string;
    tokens: number;
  }>;
  tokens: TokenEntry[];
  contrast: ContrastEntry[];
}

export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  from: string;
}

export interface ComponentEntry {
  name: string;
  kind: "component" | "hook";
  import: string;
  description?: string;
  source: string;
  propsType?: string;
  props: PropEntry[];
  inheritedProps?: string;
  tokenGroups?: string[];
  stories?: Array<{ id: string; name: string }>;
  tests?: string[];
}

export interface ComponentManifest {
  package: string;
  components: ComponentEntry[];
}

const readJson = <T>(specifier: string): T =>
  JSON.parse(readFileSync(fileURLToPath(import.meta.resolve(specifier)), "utf8")) as T;

const repoFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../../${path}`, import.meta.url)), "utf8");

export const tokens = readJson<TokenManifest>("@dsw/tokens/generated/tokens.json");
export const components = readJson<ComponentManifest>("@dsw/ui/generated/components.json");

export const docs = {
  architecture: repoFile("ARCHITECTURE.md"),
  accessibility: repoFile("ACCESSIBILITY.md"),
};

export function dtcgFor(brand: string, mode: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../../tokens/generated/dtcg/${brand}-${mode}.tokens.json`, import.meta.url)),
    "utf8",
  );
}

export const DEFAULT_THEME = "iris/light";
export const tokenByRef = new Map(tokens.tokens.map((t) => [t.ref, t]));
