/**
 * Loads the generated design-system manifests and docs once, at startup.
 * Nothing here imports StyleX token modules: those only run inside the
 * StyleX compiler. The manifests are produced from them statically and
 * checked against the browser in CI (e2e/token-export.spec.ts).
 */
import { existsSync, readFileSync } from "node:fs";
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

/**
 * Installed from npm, the build copies everything the server reads into
 * dist/data (see scripts/build.ts). In this repo it reads the workspace
 * packages and docs directly, so they're never stale while developing.
 */
const bundled = new URL("./data/", import.meta.url);
const isBundled = existsSync(fileURLToPath(new URL("tokens.json", bundled)));

const read = (url: URL | string) => readFileSync(fileURLToPath(url), "utf8");
const readJson = <T>(bundledName: string, specifier: string): T =>
  JSON.parse(read(isBundled ? new URL(bundledName, bundled) : import.meta.resolve(specifier))) as T;
const repoDoc = (name: string) =>
  read(isBundled ? new URL(name, bundled) : new URL(`../../../${name}`, import.meta.url));

export const tokens = readJson<TokenManifest>("tokens.json", "@dsw/tokens/generated/tokens.json");
export const components = readJson<ComponentManifest>("components.json", "@dsw/ui/generated/components.json");

export const docs = {
  architecture: repoDoc("ARCHITECTURE.md"),
  accessibility: repoDoc("ACCESSIBILITY.md"),
};

export function dtcgFor(brand: string, mode: string): string {
  const file = `${brand}-${mode}.tokens.json`;
  return read(
    isBundled
      ? new URL(`dtcg/${file}`, bundled)
      : new URL(`../../tokens/generated/dtcg/${file}`, import.meta.url),
  );
}

export const DEFAULT_THEME = "iris/light";
export const tokenByRef = new Map(tokens.tokens.map((t) => [t.ref, t]));
