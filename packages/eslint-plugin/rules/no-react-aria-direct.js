/**
 * @dsw/no-react-aria-direct
 *
 * App code imports components from @dsw/ui, not from React Aria, which
 * @dsw/ui is built on. A direct import gets the behaviour without the
 * system's tokens, brands, forced-colours handling and defaults. Type
 * imports and providers (RouterProvider, I18nProvider) are fine.
 */
const SOURCES = new Set(["react-aria-components", "react-aria", "react-stately"]);
const DEFAULT_ALLOW = ["RouterProvider", "I18nProvider"];

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: { description: "Import components from @dsw/ui rather than React Aria directly" },
    schema: [
      {
        type: "object",
        properties: { allow: { type: "array", items: { type: "string" } } },
        additionalProperties: false,
      },
    ],
    messages: {
      direct:
        "Import {{names}} from @dsw/ui, not {{source}}: the unstyled primitive skips the system's tokens, brands and accessibility defaults. If @dsw/ui has no equivalent, raise it with the design-system team rather than styling your own.",
    },
  },
  create(context) {
    const allow = new Set(context.options[0]?.allow ?? DEFAULT_ALLOW);
    return {
      ImportDeclaration(node) {
        const source = String(node.source.value);
        if (!SOURCES.has(source) || /** @type {any} */ (node).importKind === "type") return;
        const names = node.specifiers
          .filter((s) => /** @type {any} */ (s).importKind !== "type")
          .map((s) => (s.type === "ImportSpecifier" ? s.imported.name ?? s.imported.value : s.local.name))
          .filter((n) => !allow.has(n));
        if (names.length === 0) return;
        context.report({ node, messageId: "direct", data: { names: names.join(", "), source } });
      },
    };
  },
};
