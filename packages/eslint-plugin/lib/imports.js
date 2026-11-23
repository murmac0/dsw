/** Helpers for rules that rewrite code to use @dsw/ui. */

export const DS_PACKAGE = "@dsw/ui";

/**
 * Whether `name` can be introduced as an import from @dsw/ui at `node`:
 * true if it's unbound, or already bound to the @dsw/ui export. False if
 * something else (a local component, another library) owns the name.
 *
 * @param {import("eslint").Rule.RuleContext} context
 * @param {import("estree").Node} node
 * @param {string} name
 */
export function canUseName(context, node, name) {
  let scope = context.sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(name);
    if (variable) {
      return variable.defs.some(
        (d) =>
          d.type === "ImportBinding" &&
          d.parent?.type === "ImportDeclaration" &&
          d.parent.source.value === DS_PACKAGE,
      );
    }
    scope = scope.upper;
  }
  return true;
}

/**
 * Fixer operations that make `name` importable from @dsw/ui: nothing if
 * it already is, a new specifier on an existing @dsw/ui import, or a new
 * import after the last one.
 *
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").Rule.RuleFixer} fixer
 * @param {string} name
 * @returns {import("eslint").Rule.Fix[]}
 */
export function ensureImport(sourceCode, fixer, name) {
  const body = sourceCode.ast.body;
  const imports = body.filter((n) => n.type === "ImportDeclaration");
  const ds = imports.find(
    (n) => n.source.value === DS_PACKAGE && /** @type {any} */ (n).importKind !== "type",
  );
  if (ds) {
    const named = ds.specifiers.filter((s) => s.type === "ImportSpecifier");
    if (named.some((s) => s.local.name === name)) return [];
    const last = named.at(-1);
    if (last) return [fixer.insertTextAfter(last, `, ${name}`)];
  }
  const statement = `import { ${name} } from "${DS_PACKAGE}";`;
  const lastImport = imports.at(-1);
  if (lastImport) return [fixer.insertTextAfter(lastImport, `\n${statement}`)];
  const first = body[0];
  return first ? [fixer.insertTextBefore(first, `${statement}\n`)] : [];
}
