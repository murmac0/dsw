/**
 * Builds a machine-readable manifest of @dsw/ui from its TypeScript types
 * and doc comments, for tools such as the @dsw/mcp server.
 *
 * Writes generated/components.json: every exported component with its
 * description, import line, props (name, type, required, docs, origin),
 * the token groups it paints with, and its Storybook stories.
 *
 * Usage: node scripts/build-manifest.ts [--check]
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = join(ROOT, "src/index.ts");
const OUT = join(ROOT, "generated/components.json");

const config = ts.getParsedCommandLineOfConfigFile(join(ROOT, "tsconfig.json"), {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (d) => {
    throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  },
});
if (!config) throw new Error("Could not read tsconfig.json");
const program = ts.createProgram([ENTRY], { ...config.options, noEmit: true });
const checker = program.getTypeChecker();
const entry = program.getSourceFile(ENTRY);
if (!entry) throw new Error("Entry not found");
const moduleSymbol = checker.getSymbolAtLocation(entry);
if (!moduleSymbol) throw new Error("Entry has no module symbol");

/**
 * Inherited React Aria props worth surfacing. Everything declared in our
 * own source is always included; of the ~100 props React Aria contributes,
 * these are the ones people actually reach for.
 */
const COMMON_INHERITED = new Set([
  "isDisabled", "isRequired", "isInvalid", "isReadOnly",
  "value", "defaultValue", "onChange",
  "isSelected", "defaultSelected", "isIndeterminate",
  "isOpen", "defaultOpen", "onOpenChange",
  "onPress", "type", "name", "form", "id",
  "autoComplete", "inputMode", "maxLength", "minLength", "pattern",
  "validate", "validationBehavior", "autoFocus",
  "aria-label", "aria-labelledby", "aria-describedby",
  "textValue", "selectionMode",
]);

const repoRelative = (f: string) => relative(resolve(ROOT, "../.."), f);
const isOwn = (f: string) => f.startsWith(join(ROOT, "src"));
const docs = (s: ts.Symbol) =>
  ts.displayPartsToString(s.getDocumentationComment(checker)).replace(/\s+\n/g, "\n").trim();

function originOf(sym: ts.Symbol): string {
  const f = sym.declarations?.[0]?.getSourceFile().fileName ?? "";
  if (isOwn(f)) return "@dsw/ui";
  const m = /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(@[^/]+\/[^/]+|[^/]+)/.exec(f);
  return m?.[1] ?? "unknown";
}

/**
 * A readable type for a prop: string-literal unions are spelled out (an
 * agent needs `"primary" | "danger"`, not `ButtonVariant`); otherwise the
 * type as written in our source (`ReactNode`, not its 160-char expansion),
 * falling back to the checker's rendering for inherited props.
 */
function typeText(sym: ts.Symbol, at: ts.Node): string {
  const t = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(sym, at));
  if (t.isUnion() && t.types.every((m) => m.isStringLiteral() || m.isNumberLiteral() || m.flags & ts.TypeFlags.BooleanLiteral)) {
    // Prefer the union as declared: the checker orders members by internal
    // type id, which shifts whenever other code creates the same literal
    // first ("danger" | "primary" … instead of "primary" | … | "danger").
    const declared = declaredLiteralUnion(sym);
    if (declared) return declared;
    const literal = checker.typeToString(t, at, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias);
    if (literal.length <= 160) return literal;
  }
  const decl = sym.declarations?.[0];
  if (decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type) {
    const written = decl.type.getText();
    if (written.length <= 160) return written;
  }
  const text = checker.typeToString(t, at, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

/**
 * A literal union in source order, following one type alias if needed
 * (`variant?: ButtonVariant` → its declaration). Undefined when the prop's
 * declared type isn't a plain literal union.
 */
function declaredLiteralUnion(sym: ts.Symbol): string | undefined {
  const decl = sym.declarations?.[0];
  if (!decl || !(ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) || !decl.type) return undefined;
  let node: ts.TypeNode = decl.type;
  if (ts.isTypeReferenceNode(node)) {
    const target = checker.getSymbolAtLocation(node.typeName);
    const resolved = target && target.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(target) : target;
    const alias = resolved?.declarations?.find(ts.isTypeAliasDeclaration);
    if (!alias) return undefined;
    node = alias.type;
  }
  if (!ts.isUnionTypeNode(node) || !node.types.every((m) => ts.isLiteralTypeNode(m))) return undefined;
  const text = node.types.map((m) => m.getText()).join(" | ");
  return text.length <= 160 ? text.replaceAll("'", '"') : undefined;
}

/** Token groups a component's source imports from @dsw/tokens/components. */
function tokenGroupsOf(file: string): string[] {
  const sf = program.getSourceFile(file);
  const out = new Set<string>();
  const visit = (f: ts.SourceFile | undefined, seen = new Set<string>()) => {
    if (!f || seen.has(f.fileName)) return;
    seen.add(f.fileName);
    for (const stmt of f.statements) {
      if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier)) continue;
      const spec = stmt.moduleSpecifier.text;
      const named = stmt.importClause?.namedBindings;
      if (spec === "@dsw/tokens/components.stylex" && named && ts.isNamedImports(named)) {
        for (const el of named.elements) out.add((el.propertyName ?? el.name).text);
      }
      // Follow the component's own style modules (Field.styles, Checkbox.styles…).
      if (spec.startsWith(".") && /styles$/i.test(spec)) {
        visit(program.getSourceFile(resolve(dirname(f.fileName), `${spec}.ts`)), seen);
      }
    }
  };
  visit(sf);
  return [...out].sort();
}

/** Storybook stories for a component directory: title + export names → ids. */
function storiesOf(dir: string) {
  const out: Array<{ id: string; name: string }> = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".stories.tsx"))) {
    const sf = ts.createSourceFile(f, readFileSync(join(dir, f), "utf8"), ts.ScriptTarget.Latest, true);
    let title = "";
    const names: string[] = [];
    for (const stmt of sf.statements) {
      if (ts.isVariableStatement(stmt)) {
        for (const d of stmt.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) continue;
          const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
          if (d.name.text === "meta" && d.initializer) {
            const m = /title:\s*"([^"]+)"/.exec(d.initializer.getText());
            if (m?.[1]) title = m[1];
          } else if (exported) names.push(d.name.text);
        }
      }
    }
    // Storybook's id rules differ by part: the title is only lowercased and
    // sanitised ("Components/CheckboxGroup" → "components-checkboxgroup"),
    // while export names are split into words first ("WithDescription" →
    // "with-description"). Verified against Storybook's index.json.
    const sanitize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const words = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    for (const n of names) out.push({ id: `${sanitize(title)}--${sanitize(words(n))}`, name: n });
  }
  return out;
}

interface PropOut {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  from: string;
}

const exportsList = checker.getExportsOfModule(moduleSymbol);
const byName = new Map(exportsList.map((s) => [s.name, s]));
const components: unknown[] = [];

for (const sym of exportsList) {
  const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
  if (!(target.flags & ts.SymbolFlags.Value)) continue; // types only
  const name = sym.name;
  const decl = target.valueDeclaration ?? target.declarations?.[0];
  if (!decl) continue;
  const file = decl.getSourceFile().fileName;
  const own = isOwn(file);
  const isHook = /^use[A-Z]/.test(name);

  let props: PropOut[] = [];
  let inheritedCount = 0;
  const propsType = byName.get(`${name}Props`);
  if (propsType) {
    const t = checker.getDeclaredTypeOfSymbol(
      propsType.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(propsType) : propsType,
    );
    for (const p of checker.getPropertiesOfType(t)) {
      const from = originOf(p);
      const isOwnProp = from === "@dsw/ui";
      if (!isOwnProp && !COMMON_INHERITED.has(p.name)) {
        inheritedCount++;
        continue;
      }
      const description = docs(p);
      props.push({
        name: p.name,
        type: typeText(p, decl),
        required: !(p.flags & ts.SymbolFlags.Optional),
        ...(description && { description: description.split("\n\n")[0] }),
        from,
      });
    }
    props = props.sort(
      (a, b) =>
        Number(b.from === "@dsw/ui") - Number(a.from === "@dsw/ui") ||
        Number(b.required) - Number(a.required) ||
        a.name.localeCompare(b.name),
    );
  }

  const dir = dirname(file);
  components.push({
    name,
    kind: isHook ? "hook" : "component",
    import: `import { ${name} } from "@dsw/ui";`,
    description: docs(target) || undefined,
    source: own ? repoRelative(file) : `re-exported from ${originOf(target)}`,
    ...(propsType && { propsType: `${name}Props` }),
    props,
    ...(inheritedCount && {
      inheritedProps: `${inheritedCount} more props inherited from React Aria (event handlers, aria-* and less common options).`,
    }),
    ...(own && !isHook && { tokenGroups: tokenGroupsOf(file) }),
    ...(own && !isHook && { stories: storiesOf(dir) }),
    ...(own && !isHook && existsSync(dir) && {
      tests: readdirSync(dir).filter((f) => f.endsWith(".test.tsx")).map((f) => repoRelative(join(dir, f))),
    }),
  });
}

const manifest = {
  $comment:
    "Generated by packages/ui/scripts/build-manifest.ts from the TypeScript sources. Do not edit; run `pnpm --filter @dsw/ui manifest`.",
  package: "@dsw/ui",
  components,
};
const content = `${JSON.stringify(manifest, null, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== content) {
    console.error("generated/components.json is out of date. Run `pnpm --filter @dsw/ui manifest`.");
    process.exit(1);
  }
  console.log(`Component manifest up to date (${components.length} exports).`);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, content);
  console.log(`Wrote ${components.length} exports → ${repoRelative(OUT)}`);
}
