/**
 * Token import rules.
 *
 * @dsw/no-primitive-tokens: primitives are the raw palette and scales.
 * They don't follow the theme and aren't contrast-audited; use semantic
 * tokens or the component's own tokens.
 *
 * @dsw/no-token-barrel: StyleX can't trace defineVars() through the
 * @dsw/tokens re-export barrel, so token groups come from their origin
 * file. (Type imports from the barrel are fine.)
 */

/** @type {import("eslint").Rule.RuleModule} */
export const noPrimitiveTokens = {
  meta: {
    type: "problem",
    docs: { description: "Disallow primitive token imports outside @dsw/tokens" },
    schema: [],
    messages: {
      primitive:
        "Don't use primitive tokens directly: they don't follow the theme and aren't contrast-audited. Use @dsw/tokens/semantic.stylex, or the component's tokens in @dsw/tokens/components.stylex.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === "@dsw/tokens/primitives.stylex") {
          context.report({ node, messageId: "primitive" });
        }
      },
    };
  },
};

/** @type {import("eslint").Rule.RuleModule} */
export const noTokenBarrel = {
  meta: {
    type: "problem",
    docs: { description: "Import token groups from their origin file, not the @dsw/tokens barrel" },
    schema: [],
    messages: {
      barrel:
        "Import {{names}} from its origin file (e.g. @dsw/tokens/semantic.stylex), not @dsw/tokens: StyleX can't trace token groups through a re-export.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "@dsw/tokens" || /** @type {any} */ (node).importKind === "type") return;
        const names = node.specifiers
          .filter((s) => /** @type {any} */ (s).importKind !== "type")
          .map((s) => s.local.name);
        if (names.length) context.report({ node, messageId: "barrel", data: { names: names.join(", ") } });
      },
    };
  },
};

/** @type {import("eslint").Rule.RuleModule} */
export const noInlineStyle = {
  meta: {
    type: "suggestion",
    docs: { description: "Avoid inline style objects in JSX" },
    schema: [],
    messages: {
      inline:
        "Avoid inline style objects: they bypass tokens and conflict with stylex.props(). Use a @dsw/ui component or stylex.create() (with a style function for runtime values).",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.type === "JSXIdentifier" &&
          node.name.name === "style" &&
          node.value?.type === "JSXExpressionContainer" &&
          node.value.expression.type === "ObjectExpression"
        ) {
          context.report({ node, messageId: "inline" });
        }
      },
    };
  },
};
