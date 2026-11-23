/**
 * @dsw/prefer-layout-primitives
 *
 * In app code, a StyleX style that only lays children out with a gap
 * (flex column, flex row, grid) is a hand-written Stack, Inline or Grid.
 * The components take gaps from the spacing scale and handle wrapping and
 * phone widths, so the call site doesn't need breakpoints.
 *
 * Only styles with a `gap` are flagged: flex used to centre an icon or
 * push one item aside is a component's internals, not page layout.
 */
const isStylexCreate = (node) =>
  node.callee.type === "MemberExpression" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name === "stylex" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "create";

const keyName = (p) =>
  p.type === "Property" && (p.key.type === "Identifier" ? p.key.name : p.key.type === "Literal" ? String(p.key.value) : null);

/** A literal value, or the `default` of a conditional object. */
function literalOf(value) {
  if (value?.type === "Literal") return value.value;
  if (value?.type === "ObjectExpression") {
    const d = value.properties.find((p) => keyName(p) === "default");
    return d?.value?.type === "Literal" ? d.value.value : undefined;
  }
  return undefined;
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: { description: "Use Stack, Inline or Grid from @dsw/ui instead of hand-written layout styles" },
    schema: [],
    messages: {
      prefer:
        "This style is a hand-written {{component}}. Use <{{component}} gap=\"…\"> from @dsw/ui: {{why}}",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isStylexCreate(node)) return;
        const namespaces = node.arguments[0];
        if (namespaces?.type !== "ObjectExpression") return;
        for (const ns of namespaces.properties) {
          if (ns.type !== "Property" || ns.value.type !== "ObjectExpression") continue;
          const props = new Map(ns.value.properties.map((p) => [keyName(p), p]));
          const display = props.get("display");
          if (!display || !props.has("gap")) continue;
          const kind = literalOf(display.value);
          const direction = literalOf(props.get("flexDirection")?.value);
          let component;
          let why;
          if (kind === "flex" && (direction === "column" || direction === "column-reverse")) {
            component = "Stack";
            why = "gaps come from the spacing scale, with no margins to manage.";
          } else if (kind === "flex") {
            component = "Inline";
            why = "it wraps by default so rows reflow at 320px, and can stack on phones.";
          } else if (kind === "grid") {
            component = "Grid";
            why = "columns collapse on narrow screens without breakpoints at the call site.";
          }
          if (component) context.report({ node: display, messageId: "prefer", data: { component, why } });
        }
      },
    };
  },
};
