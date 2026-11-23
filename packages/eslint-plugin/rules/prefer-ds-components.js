/**
 * @dsw/prefer-ds-components
 *
 * Flags native elements that @dsw/ui has a component for: <button>,
 * <a href>, <h1>–<h6>, form inputs, <select>, <dialog>, <fieldset>.
 *
 * With `{ fix: true }` (what the `dsw-migrate` codemod uses) it rewrites
 * the cases that convert without changing behaviour, and adds the import:
 *
 *   <button onClick={() => save()} disabled={busy}>  →  <Button onPress={() => save()} isDisabled={busy}>
 *   <a href="/docs" target="_blank" rel="noopener">    →  <Link href="/docs" isExternal>
 *   <h2 id="title">                                    →  <Heading level={2} id="title">
 *
 * Anything with className, style, spread props, or a handler that takes
 * the DOM event is reported but left for a person: those need a design
 * decision (which variant? why the custom style?), not a mechanical edit.
 */
import { canUseName, ensureImport } from "../lib/imports.js";

const WHY = {
  Button: "press handling for mouse, touch and keyboard, a focus ring, a loading state and themed variants",
  Link: "always underlined (WCAG 1.4.1), a focus ring, and `isExternal` announces new tabs",
  Heading: "the brand's display face and type scale, with level kept separate from size",
  TextField: "a visible label, description and error, all wired to the input for screen readers",
  Checkbox: "a themed, forced-colours-safe box with its label attached",
  RadioGroup: "a labelled group with arrow-key navigation (use Radio inside it)",
  Select: "a labelled, keyboard-accessible picker styled per brand",
  Dialog: "focus trapping, Escape to close, and focus restored on close",
  Fieldset: "an announced group label, and disabling every control inside",
};

const TEXT_INPUTS = new Set([
  undefined, "text", "email", "password", "search", "tel", "url", "number",
]);

/** The @dsw/ui component for a JSX element, or null. */
function componentFor(name, attrs) {
  if (name === "button") return "Button";
  if (name === "a" && attrs.has("href")) return "Link";
  if (/^h[1-6]$/.test(name)) return "Heading";
  if (name === "select") return "Select";
  if (name === "dialog") return "Dialog";
  if (name === "fieldset") return "Fieldset";
  if (name === "input") {
    const type = attrs.get("type");
    const literal = type?.value?.type === "Literal" ? String(type.value.value) : type ? null : undefined;
    if (literal === "checkbox") return "Checkbox";
    if (literal === "radio") return "RadioGroup";
    if (literal === "submit" || literal === "button") return "Button";
    if (TEXT_INPUTS.has(literal)) return "TextField";
  }
  return null;
}

const isPassthrough = (n) => n === "id" || n.startsWith("aria-") || n.startsWith("data-");

/** A handler that ignores its event, so onClick → onPress is safe. */
function isEventFreeHandler(attr) {
  const expr = attr.value?.type === "JSXExpressionContainer" ? attr.value.expression : null;
  return (
    !!expr &&
    (expr.type === "ArrowFunctionExpression" || expr.type === "FunctionExpression") &&
    expr.params.length === 0
  );
}

/**
 * Attribute edits for a safe rewrite, or null when it isn't safe.
 * @returns {Array<{ attr: any, replace: string | null }> | null}
 */
function planAttributes(component, attrs, sourceCode) {
  const plan = [];
  for (const [name, attr] of attrs) {
    if (isPassthrough(name)) continue;
    if (component === "Button") {
      if (["type", "name", "form", "value", "autoFocus"].includes(name)) continue;
      if (name === "disabled") {
        const value = attr.value ? sourceCode.getText(attr.value) : "";
        plan.push({ attr, replace: `isDisabled${value ? `=${value}` : ""}` });
        continue;
      }
      if (name === "onClick" && isEventFreeHandler(attr)) {
        plan.push({ attr, replace: `onPress=${sourceCode.getText(attr.value)}` });
        continue;
      }
      return null;
    }
    if (component === "Link") {
      if (name === "href") continue;
      if (name === "rel") {
        plan.push({ attr, replace: null });
        continue;
      }
      if (name === "target" && attr.value?.type === "Literal" && attr.value.value === "_blank") {
        plan.push({ attr, replace: "isExternal" });
        continue;
      }
      return null;
    }
    if (component === "Heading") return null;
    return null;
  }
  // rel without target=_blank would be dropped silently: not safe.
  if (component === "Link" && attrs.has("rel") && !plan.some((p) => p.replace === "isExternal")) {
    return null;
  }
  return plan;
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "Use @dsw/ui components instead of the native elements they replace",
    },
    schema: [
      {
        type: "object",
        properties: {
          fix: { type: "boolean", description: "Rewrite safe cases (used by dsw-migrate)." },
          ignore: { type: "array", items: { type: "string" }, description: "Element names to allow." },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      use: "Use <{{component}}> from @dsw/ui instead of <{{element}}>: {{why}}.",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const ignore = new Set(options.ignore ?? []);
    const sourceCode = context.sourceCode;

    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        const element = node.name.name;
        // Components start with a capital; only intrinsic elements apply.
        if (element[0] !== element[0].toLowerCase() || ignore.has(element)) return;

        const hasSpread = node.attributes.some((a) => a.type === "JSXSpreadAttribute");
        const attrs = new Map(
          node.attributes
            .filter((a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier")
            .map((a) => [a.name.name, a]),
        );
        const component = componentFor(element, attrs);
        if (!component) return;

        let fix;
        const fixable = ["Button", "Link", "Heading"].includes(component);
        if (options.fix && fixable && !hasSpread && canUseName(context, node, component)) {
          const plan = planAttributes(component, attrs, sourceCode);
          if (plan) {
            const closing = /** @type {any} */ (node.parent).closingElement;
            const level = component === "Heading" ? ` level={${element.slice(1)}}` : "";
            fix = (fixer) => [
              fixer.replaceText(node.name, `${component}${level}`),
              ...(closing ? [fixer.replaceText(closing.name, component)] : []),
              ...plan.map(({ attr, replace }) =>
                replace === null
                  ? fixer.removeRange([attr.range[0] - 1, attr.range[1]])
                  : fixer.replaceText(attr, replace),
              ),
              ...ensureImport(sourceCode, fixer, component),
            ];
          }
        }

        context.report({
          node,
          messageId: "use",
          data: { component, element, why: WHY[component] },
          ...(fix && { fix }),
        });
      },
    };
  },
};
