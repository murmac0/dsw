/**
 * Exports the design tokens, resolved for every brand × mode, by reading
 * the StyleX token sources statically — the same way StyleX's compiler
 * does. (`defineVars()` can't be imported and run outside the compiler, so
 * static analysis is the only faithful way to read them.)
 *
 * Writes:
 *   generated/tokens.json            — manifest for tools (MCP server, docs):
 *                                      every token with its value per theme,
 *                                      description, import path and alias.
 *   generated/dtcg/<brand>-<mode>.tokens.json
 *                                    — W3C Design Tokens (DTCG) files, one
 *                                      per theme, for Figma/Tokens Studio etc.
 *
 * Usage: node scripts/export-tokens.ts [--check]
 *   --check  exit non-zero if the generated files are out of date.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { AA, contrastRatio, parseColor, type ContrastKind } from "../src/color-math.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "generated");

/* ------------------------------------------------------------------ */
/* Value model                                                         */
/* ------------------------------------------------------------------ */

type Expr =
  | { k: "lit"; v: string }
  | { k: "var"; group: string; key: string }
  | { k: "tpl"; parts: Expr[] }
  | { k: "cond"; base: Expr | null; conds: Record<string, Expr | null> };

interface VarsGroup {
  kind: "vars";
  group: string;
  file: string;
  description: string;
  tokens: Record<string, Expr>;
  docs: Record<string, string>;
}

interface Theme {
  kind: "theme";
  group: string;
  overrides: Record<string, Expr>;
}

type Val =
  | string
  | number
  | boolean
  | null
  | undefined
  | Expr
  | VarsGroup
  | Theme
  | Val[]
  | { [key: string]: Val };

const isExpr = (v: Val): v is Expr =>
  typeof v === "object" && v !== null && !Array.isArray(v) && "k" in v &&
  typeof (v as { k: unknown }).k === "string";
const isVars = (v: Val): v is VarsGroup =>
  typeof v === "object" && v !== null && !Array.isArray(v) && (v as { kind?: unknown }).kind === "vars";
const isTheme = (v: Val): v is Theme =>
  typeof v === "object" && v !== null && !Array.isArray(v) && (v as { kind?: unknown }).kind === "theme";

function toExpr(v: Val, where: string): Expr | null {
  if (v === null) return null;
  if (typeof v === "string") return { k: "lit", v };
  if (typeof v === "number") return { k: "lit", v: String(v) };
  if (isExpr(v)) return v;
  if (typeof v === "object" && !Array.isArray(v) && !isVars(v) && !isTheme(v)) {
    // A StyleX conditional value: { default, "@media …": … }
    const { default: base, ...rest } = v as Record<string, Val>;
    const conds: Record<string, Expr | null> = {};
    for (const [cond, value] of Object.entries(rest)) conds[cond] = toExpr(value ?? null, where);
    return { k: "cond", base: toExpr(base ?? null, where), conds };
  }
  throw new Error(`Unsupported token value at ${where}`);
}

/* ------------------------------------------------------------------ */
/* Module evaluator (a small, strict subset of TypeScript)             */
/* ------------------------------------------------------------------ */

interface Module {
  file: string;
  sf: ts.SourceFile;
  decls: Map<string, ts.VariableDeclaration>;
  imports: Map<string, { from: string; name: string }>;
  cache: Map<string, Val>;
}

const modules = new Map<string, Module>();

function loadModule(file: string): Module {
  const existing = modules.get(file);
  if (existing) return existing;
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const mod: Module = { file, sf, decls: new Map(), imports: new Map(), cache: new Map() };
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const spec = stmt.moduleSpecifier.text;
      if (!spec.startsWith(".")) continue;
      const bindings = stmt.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const el of bindings.elements) {
          mod.imports.set(el.name.text, {
            from: resolve(dirname(file), `${spec}.ts`),
            name: (el.propertyName ?? el.name).text,
          });
        }
      }
    }
    if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) mod.decls.set(d.name.text, d);
      }
    }
  }
  modules.set(file, mod);
  return mod;
}

function jsDocOf(node: ts.Node): string {
  return ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((d) => ts.getTextOfJSDocComment(d.comment) ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function lookup(mod: Module, name: string): Val {
  if (mod.cache.has(name)) return mod.cache.get(name);
  const decl = mod.decls.get(name);
  if (decl?.initializer) {
    const value = evaluate(mod, decl.initializer, name);
    mod.cache.set(name, value);
    return value;
  }
  const imp = mod.imports.get(name);
  if (imp) return lookup(loadModule(imp.from), imp.name);
  throw new Error(`Unresolved identifier "${name}" in ${mod.file}`);
}

function propName(mod: Module, name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name)) {
    const v = evaluate(mod, name.expression);
    if (typeof v === "string") return v;
  }
  throw new Error(`Unsupported property name ${name.getText()} in ${mod.file}`);
}

function evaluate(mod: Module, node: ts.Expression, declName?: string): Val {
  const where = `${mod.file}:${mod.sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node))
    return evaluate(mod, node.expression, declName);
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const v = evaluate(mod, node.operand);
    if (typeof v === "number") return -v;
  }
  if (ts.isIdentifier(node)) return lookup(mod, node.text);
  if (ts.isTemplateExpression(node)) {
    const parts: Expr[] = [];
    if (node.head.text) parts.push({ k: "lit", v: node.head.text });
    for (const span of node.templateSpans) {
      const e = toExpr(evaluate(mod, span.expression), where);
      if (e) parts.push(e);
      if (span.literal.text) parts.push({ k: "lit", v: span.literal.text });
    }
    return parts.every((p) => p.k === "lit")
      ? parts.map((p) => (p as { v: string }).v).join("")
      : { k: "tpl", parts };
  }
  if (ts.isPropertyAccessExpression(node)) {
    const target = evaluate(mod, node.expression);
    const key = node.name.text;
    if (isVars(target)) {
      if (!(key in target.tokens)) throw new Error(`Unknown token ${target.group}.${key} at ${where}`);
      return { k: "var", group: target.group, key };
    }
    if (target && typeof target === "object" && !Array.isArray(target)) {
      return (target as Record<string, Val>)[key];
    }
    throw new Error(`Cannot read .${key} at ${where}`);
  }
  if (ts.isArrayLiteralExpression(node)) {
    const out: Val[] = [];
    for (const el of node.elements) {
      if (ts.isSpreadElement(el)) {
        const spread = evaluate(mod, el.expression);
        if (!Array.isArray(spread)) throw new Error(`Spread of non-array at ${where}`);
        out.push(...spread);
      } else out.push(evaluate(mod, el));
    }
    return out;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const out: Record<string, Val> = {};
    for (const p of node.properties) {
      if (ts.isPropertyAssignment(p)) out[propName(mod, p.name)] = evaluate(mod, p.initializer);
      else if (ts.isShorthandPropertyAssignment(p)) out[p.name.text] = lookup(mod, p.name.text);
      else throw new Error(`Unsupported object member at ${where}`);
    }
    return out;
  }
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
    const fn = node.expression.name.text;
    const [first, second] = node.arguments;
    if (fn === "defineConsts" && first) return evaluate(mod, first);
    if (fn === "defineVars" && first && ts.isObjectLiteralExpression(first) && declName) {
      const group: VarsGroup = {
        kind: "vars",
        group: declName,
        file: mod.file,
        description: "",
        tokens: {},
        docs: {},
      };
      // Register before evaluating values, so tokens may reference siblings.
      mod.cache.set(declName, group);
      const stmt = node.parent?.parent?.parent;
      if (stmt) group.description = jsDocOf(stmt);
      for (const p of first.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        group.tokens[propName(mod, p.name)] = { k: "lit", v: "" };
      }
      for (const p of first.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = propName(mod, p.name);
        const expr = toExpr(evaluate(mod, p.initializer), `${where} ${key}`);
        if (!expr) throw new Error(`Token ${declName}.${key} has no value`);
        group.tokens[key] = expr;
        const doc = jsDocOf(p);
        if (doc) group.docs[key] = doc;
      }
      return group;
    }
    if (fn === "createTheme" && first && second) {
      const target = evaluate(mod, first);
      if (!isVars(target)) throw new Error(`createTheme target isn't a defineVars group at ${where}`);
      const overrides = evaluate(mod, second) as Record<string, Val>;
      const theme: Theme = { kind: "theme", group: target.group, overrides: {} };
      for (const [key, v] of Object.entries(overrides)) {
        if (!(key in target.tokens)) throw new Error(`Theme overrides unknown token ${target.group}.${key} at ${where}`);
        const e = toExpr(v, `${where} ${key}`);
        if (e) theme.overrides[key] = e;
      }
      return theme;
    }
    if (fn === "keyframes") return null;
  }
  throw new Error(`Unsupported expression (${ts.SyntaxKind[node.kind]}) at ${where}: ${node.getText().slice(0, 80)}`);
}

/* ------------------------------------------------------------------ */
/* Resolution                                                          */
/* ------------------------------------------------------------------ */

type Overrides = Map<string, Record<string, Expr>>;
const groups = new Map<string, VarsGroup>();

function resolveExpr(e: Expr | null, ov: Overrides, seen: string[] = []): string {
  if (!e) return "";
  switch (e.k) {
    case "lit":
      return e.v;
    case "tpl":
      return e.parts.map((p) => resolveExpr(p, ov, seen)).join("");
    case "cond":
      return resolveExpr(e.base, ov, seen);
    case "var": {
      const id = `${e.group}.${e.key}`;
      if (seen.includes(id)) throw new Error(`Token cycle: ${[...seen, id].join(" → ")}`);
      const g = groups.get(e.group);
      if (!g) throw new Error(`Unknown group ${e.group}`);
      const expr = ov.get(e.group)?.[e.key] ?? g.tokens[e.key] ?? null;
      return resolveExpr(expr, ov, [...seen, id]);
    }
  }
}

/** The source-level reference a token points at, if it's a plain alias. */
function aliasOf(e: Expr | undefined): string | undefined {
  if (!e) return undefined;
  if (e.k === "var") return `${e.group}.${e.key}`;
  if (e.k === "cond" && e.base?.k === "var") return `${e.base.group}.${e.base.key}`;
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Load the system                                                     */
/* ------------------------------------------------------------------ */

const semanticMod = loadModule(join(SRC, "semantic.stylex.ts"));
const componentsMod = loadModule(join(SRC, "components.stylex.ts"));
const themesMod = loadModule(join(SRC, "themes/index.ts"));
const breakpointsMod = loadModule(join(SRC, "breakpoints.stylex.ts"));

const IMPORTS: Record<string, string> = {
  [semanticMod.file]: "@dsw/tokens/semantic.stylex",
  [componentsMod.file]: "@dsw/tokens/components.stylex",
};

for (const mod of [semanticMod, componentsMod]) {
  for (const name of mod.decls.keys()) {
    const v = lookup(mod, name);
    if (isVars(v)) groups.set(v.group, v);
  }
}

const themeRegistry = lookup(themesMod, "themes") as Record<string, Record<string, Val[]>>;
const brandInfo = lookup(themesMod, "brands") as Array<Record<string, Val>>;
const breakpoints = lookup(breakpointsMod, "breakpoints") as Record<string, string>;

const themeKeys: string[] = [];
const themeOverrides = new Map<string, Overrides>();
for (const [brand, modes] of Object.entries(themeRegistry)) {
  for (const [mode, list] of Object.entries(modes)) {
    const key = `${brand}/${mode}`;
    themeKeys.push(key);
    const ov: Overrides = new Map();
    for (const t of list) {
      if (!isTheme(t)) throw new Error(`themes.${brand}.${mode} contains a non-theme`);
      if (ov.has(t.group)) {
        // Mirrors the runtime rule: two overrides of one group on <html>
        // have no defined winner, so a theme list must not contain them.
        throw new Error(`themes.${brand}.${mode} overrides "${t.group}" twice`);
      }
      ov.set(t.group, t.overrides);
    }
    themeOverrides.set(key, ov);
  }
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

const COMPONENT_OF: Record<string, string> = {
  button: "Button",
  field: "TextField, Select",
  selection: "Checkbox, Radio, CheckboxGroup, RadioGroup",
  switch: "Switch",
  menu: "Select (menu)",
  dialog: "Dialog",
  fieldset: "Fieldset",
};

function tierOf(g: VarsGroup) {
  return g.file === componentsMod.file ? "component" : "semantic";
}

function componentOf(group: string): string | undefined {
  const m = /^(\w+?)(Tokens|Shape)$/.exec(group);
  return m?.[1] ? COMPONENT_OF[m[1]] : undefined;
}

/** DTCG $type + $value for a resolved CSS value, or undefined if untyped. */
function toDtcg(group: string, key: string, value: string): { $type?: string; $value: unknown } {
  const v = value.trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(v);
  if (hex?.[1]) {
    const n = parseInt(hex[1], 16);
    return {
      $type: "color",
      $value: { colorSpace: "srgb", components: [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((c) => +c.toFixed(4)), alpha: 1, hex: v.toLowerCase() },
    };
  }
  const rgba = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i.exec(v);
  if (rgba) {
    const [r, g, b, a] = [rgba[1], rgba[2], rgba[3], rgba[4]].map((x) => (x === undefined ? 1 : Number(x)));
    return { $type: "color", $value: { colorSpace: "srgb", components: [r!, g!, b!].map((c) => +(c / 255).toFixed(4)), alpha: a } };
  }
  if (group === "fontFamily" || key.toLowerCase().includes("font") && v.includes(",")) {
    return { $type: "fontFamily", $value: v.split(",").map((f) => f.trim().replace(/^"|"$/g, "")) };
  }
  const dim = /^(-?[\d.]+)(px|rem|em)$/.exec(v);
  if (dim) return { $type: "dimension", $value: { value: Number(dim[1]), unit: dim[2] } };
  const dur = /^([\d.]+)ms$/.exec(v);
  if (dur) return { $type: "duration", $value: { value: Number(dur[1]), unit: "ms" } };
  const bez = /^cubic-bezier\(([^)]+)\)$/.exec(v);
  if (bez?.[1]) return { $type: "cubicBezier", $value: bez[1].split(",").map(Number) };
  if (/^-?[\d.]+$/.test(v)) {
    return { $type: group === "fontWeight" || key === "fontWeight" ? "fontWeight" : "number", $value: Number(v) };
  }
  return { $value: v };
}

/* ------------------------------------------------------------------ */
/* Build outputs                                                       */
/* ------------------------------------------------------------------ */

interface TokenOut {
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

const tokens: TokenOut[] = [];
const dtcg: Record<string, Record<string, Record<string, unknown>>> = {};
for (const k of themeKeys) dtcg[k] = {};

for (const g of groups.values()) {
  for (const key of Object.keys(g.tokens)) {
    const out: TokenOut = {
      ref: `${g.group}.${key}`,
      group: g.group,
      key,
      tier: tierOf(g),
      import: IMPORTS[g.file] ?? "",
      values: {},
    };
    const component = componentOf(g.group);
    if (component) out.component = component;
    const doc = g.docs[key];
    if (doc) out.description = doc;

    const aliases: Record<string, string> = {};
    for (const themeKey of themeKeys) {
      const ov = themeOverrides.get(themeKey)!;
      const expr = ov.get(g.group)?.[key] ?? g.tokens[key]!;
      const value = resolveExpr(expr, ov, [out.ref]);
      out.values[themeKey] = value;
      const alias = aliasOf(expr);
      if (alias) aliases[themeKey] = alias;

      if (expr.k === "cond") {
        for (const [cond, ce] of Object.entries(expr.conds)) {
          out.conditions ??= {};
          (out.conditions[cond] ??= {})[themeKey] = resolveExpr(ce, ov, [out.ref]);
        }
      }

      const typed = toDtcg(g.group, key, value);
      if (!out.type && typed.$type) out.type = typed.$type;
      const tree = dtcg[themeKey]!;
      const groupNode = (tree[g.group] ??= g.description ? { $description: g.description } : {});
      groupNode[key] = {
        ...typed,
        ...(doc && { $description: doc }),
        $extensions: {
          "dev.dsw": {
            ref: out.ref,
            import: out.import,
            ...(alias && { alias }),
            ...(expr.k === "cond" && {
              conditions: Object.fromEntries(
                Object.entries(expr.conds).map(([c, ce]) => [c, resolveExpr(ce, ov, [out.ref])]),
              ),
            }),
          },
        },
      };
    }
    if (Object.keys(aliases).length) out.alias = aliases;
    tokens.push(out);
  }
}

/* ------------------------------------------------------------------ */
/* Audited contrast pairings (src/contrast.ts), ratios per theme        */
/* ------------------------------------------------------------------ */

const contrastMod = loadModule(join(SRC, "contrast.ts"));
const pairsDecl = contrastMod.decls.get("contrastPairs")?.initializer;
let pairsArray: ts.Expression | undefined = pairsDecl;
while (pairsArray && (ts.isAsExpression(pairsArray) || ts.isSatisfiesExpression(pairsArray))) {
  pairsArray = pairsArray.expression;
}
if (!pairsArray || !ts.isArrayLiteralExpression(pairsArray)) throw new Error("contrastPairs not found");

const contrast = pairsArray.elements.map((el) => {
  if (!ts.isCallExpression(el) || el.arguments.length !== 5) throw new Error(`Unexpected contrastPairs entry: ${el.getText()}`);
  const [component, usage, kind, fg, bg] = el.arguments.map((a) => evaluate(contrastMod, a));
  if (!isExpr(fg as Val) || !isExpr(bg as Val) || (fg as Expr).k !== "var" || (bg as Expr).k !== "var") {
    throw new Error(`contrast pair must reference tokens: ${el.getText()}`);
  }
  const fgE = fg as Extract<Expr, { k: "var" }>;
  const bgE = bg as Extract<Expr, { k: "var" }>;
  const min = AA[kind as ContrastKind];
  const ratios: Record<string, number> = {};
  for (const themeKey of themeKeys) {
    const ov = themeOverrides.get(themeKey)!;
    const a = parseColor(resolveExpr(fgE, ov));
    const b = parseColor(resolveExpr(bgE, ov));
    ratios[themeKey] = a && b ? +contrastRatio(a, b).toFixed(2) : 0;
  }
  return {
    component: component as string,
    usage: usage as string,
    kind: kind as ContrastKind,
    min,
    fg: `${fgE.group}.${fgE.key}`,
    bg: `${bgE.group}.${bgE.key}`,
    ratios,
    pass: Object.values(ratios).every((r) => r >= min),
  };
});

const manifest = {
  $comment:
    "Generated by packages/tokens/scripts/export-tokens.ts from the StyleX sources. Do not edit; run `pnpm --filter @dsw/tokens export`.",
  themes: themeKeys,
  brands: brandInfo,
  breakpoints,
  groups: [...groups.values()].map((g) => ({
    name: g.group,
    tier: tierOf(g),
    import: IMPORTS[g.file],
    ...(componentOf(g.group) && { component: componentOf(g.group) }),
    ...(g.description && { description: g.description }),
    tokens: Object.keys(g.tokens).length,
  })),
  tokens,
  contrast,
};

const files = new Map<string, string>();
files.set(join(OUT, "tokens.json"), `${JSON.stringify(manifest, null, 2)}\n`);
for (const k of themeKeys) {
  const [brand, mode] = k.split("/");
  files.set(
    join(OUT, "dtcg", `${brand}-${mode}.tokens.json`),
    `${JSON.stringify({ $description: `@dsw design tokens — ${brand} ${mode}`, ...dtcg[k] }, null, 2)}\n`,
  );
}

if (process.argv.includes("--check")) {
  const stale = [...files].filter(([f, c]) => !existsSync(f) || readFileSync(f, "utf8") !== c).map(([f]) => f);
  if (stale.length) {
    console.error(`Generated tokens are out of date. Run \`pnpm --filter @dsw/tokens export\`:\n  ${stale.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`Token export up to date (${tokens.length} tokens × ${themeKeys.length} themes).`);
} else {
  for (const [f, c] of files) {
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, c);
  }
  console.log(`Exported ${tokens.length} tokens × ${themeKeys.length} themes → ${OUT}`);
}
