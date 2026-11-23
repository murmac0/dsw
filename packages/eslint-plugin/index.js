/**
 * @dsw/eslint-plugin: the design system's rules, for app teams and for
 * @dsw/ui itself. The same rules run in CI, in editors, in the
 * `dsw-migrate` codemod and in the @dsw/mcp server's lint_styles tool.
 *
 *   // eslint.config.js (an app using @dsw/ui)
 *   import dsw from "@dsw/eslint-plugin";
 *   export default [...yourConfig, dsw.configs.recommended];
 */
import noRawStyleValues from "./rules/no-raw-style-values.js";
import noReactAriaDirect from "./rules/no-react-aria-direct.js";
import preferDsComponents from "./rules/prefer-ds-components.js";
import preferLayoutPrimitives from "./rules/prefer-layout-primitives.js";
import { noInlineStyle, noPrimitiveTokens, noTokenBarrel } from "./rules/token-imports.js";

const rules = {
  "no-raw-style-values": noRawStyleValues,
  "no-primitive-tokens": noPrimitiveTokens,
  "no-token-barrel": noTokenBarrel,
  "no-inline-style": noInlineStyle,
  "prefer-ds-components": preferDsComponents,
  "no-react-aria-direct": noReactAriaDirect,
  "prefer-layout-primitives": preferLayoutPrimitives,
};

const plugin = {
  meta: { name: "@dsw/eslint-plugin", version: "0.1.0" },
  rules,
  configs: {},
};

/** Rules about styling with tokens: right for any code using @dsw/tokens. */
const tokenRules = {
  "@dsw/no-raw-style-values": "error",
  "@dsw/no-primitive-tokens": "error",
  "@dsw/no-token-barrel": "error",
};

Object.assign(plugin.configs, {
  /** For apps built with @dsw/ui. */
  recommended: {
    name: "@dsw/recommended",
    plugins: { "@dsw": plugin },
    rules: {
      ...tokenRules,
      "@dsw/prefer-ds-components": "error",
      "@dsw/no-react-aria-direct": "error",
      "@dsw/prefer-layout-primitives": "warn",
      "@dsw/no-inline-style": "warn",
    },
  },
  /**
   * For @dsw/ui itself, which is *made* of native elements and React Aria,
   * so only the token rules apply.
   */
  library: {
    name: "@dsw/library",
    plugins: { "@dsw": plugin },
    rules: tokenRules,
  },
});

export default plugin;
export { rules };
