import type { ESLint, Linter, Rule } from "eslint";

declare const plugin: ESLint.Plugin & {
  rules: Record<string, Rule.RuleModule>;
  configs: {
    /** For apps built with @dsw/ui. */
    recommended: Linter.Config;
    /** For @dsw/ui itself: token rules only. */
    library: Linter.Config;
  };
};

export default plugin;
export declare const rules: Record<string, Rule.RuleModule>;
