/**
 * dsw/no-raw-style-values
 *
 * Inside stylex.create() / stylex.keyframes(), design values must come from
 * @dsw/tokens. Flags string literals (and template-literal chunks) carrying
 * lengths, durations or colours, plus numeric fontWeight / lineHeight /
 * zIndex / opacity. Percentages, full-viewport units, 0, opacity 1 and
 * keywords are fine — they're
 * layout mechanics, not design decisions.
 *
 * Escape hatch for genuine one-offs (e.g. the visually-hidden technique):
 * a `token-exempt` comment on the same line or the line above, ideally with
 * a reason: `// token-exempt: standard visually-hidden technique`.
 */
const RAW_VALUE =
  /(?:^|[^\w$-])(?:\d*\.)?\d+(?:px|rem|em|ms|s|vh|vw|dvh|svh|lvh)\b|#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i;
// "Full viewport" (100vh, 100dvh, 100vw…) is layout, like 100%.
const FULL_VIEWPORT = /\b100[dsl]?v[hw]\b/g;
const hasRawValue = (value) => RAW_VALUE.test(value.replace(FULL_VIEWPORT, ""));
const NUMERIC_PROPS = new Set(["fontWeight", "lineHeight", "zIndex", "opacity"]);
const STYLEX_FNS = new Set(["create", "keyframes"]);

function isStylexCall(node) {
  const callee = node.callee;
  return (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "stylex" &&
    callee.property.type === "Identifier" &&
    STYLEX_FNS.has(callee.property.name)
  );
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require design tokens instead of raw values in StyleX styles",
    },
    schema: [],
    messages: {
      raw: "Raw style value {{value}} — use a token from @dsw/tokens (or add `// token-exempt: <reason>`).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    let depth = 0;

    function isExempt(node) {
      const line = node.loc.start.line;
      return sourceCode
        .getAllComments()
        .some(
          (c) =>
            c.value.includes("token-exempt") &&
            (c.loc.start.line === line || c.loc.end.line === line - 1),
        );
    }

    function propertyName(node) {
      const parent = node.parent;
      if (parent?.type !== "Property" || parent.value !== node) return null;
      if (parent.key.type === "Identifier") return parent.key.name;
      if (parent.key.type === "Literal") return String(parent.key.value);
      return null;
    }

    function report(node, value) {
      if (isExempt(node)) return;
      context.report({ node, messageId: "raw", data: { value: JSON.stringify(value) } });
    }

    return {
      CallExpression(node) {
        if (isStylexCall(node)) depth++;
      },
      "CallExpression:exit"(node) {
        if (isStylexCall(node)) depth--;
      },
      Literal(node) {
        if (depth === 0) return;
        // Skip object keys (e.g. "@media (...)" conditions, "::placeholder").
        if (node.parent?.type === "Property" && node.parent.key === node) return;
        if (typeof node.value === "string" && hasRawValue(node.value)) {
          report(node, node.value);
        } else if (typeof node.value === "number") {
          const prop = propertyName(node) ?? "";
          if (!NUMERIC_PROPS.has(prop) || node.value === 0) return;
          // Fully visible is an on/off state, like 0, not a design value.
          if (prop === "opacity" && node.value === 1) return;
          report(node, node.value);
        }
      },
      TemplateElement(node) {
        if (depth === 0) return;
        if (hasRawValue(node.value.cooked ?? "")) report(node, node.value.cooked);
      },
    };
  },
};
