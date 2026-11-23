import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import dsw from "@dsw/eslint-plugin";
import { findTokens, type Suggestion } from "./tokens.ts";

const linter = new Linter({ configType: "flat" });

/**
 * "app": code built *with* @dsw/ui (the plugin's recommended preset, which
 * also prefers DS components and layout primitives). "library": code
 * inside @dsw/ui itself, which is made of native elements and React Aria,
 * so only the token rules apply. Same rules as CI and editors.
 */
export type LintScope = "app" | "library";

const configFor = (scope: LintScope): Linter.Config[] => {
  const preset = scope === "library" ? dsw.configs.library : dsw.configs.recommended;
  return [
    {
      files: ["**/*.{ts,tsx,js,jsx}"],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
        sourceType: "module",
        ecmaVersion: "latest",
      },
      ...(preset.plugins && { plugins: preset.plugins }),
      ...(preset.rules && { rules: preset.rules }),
    },
  ];
};

export interface LintFinding {
  line: number;
  column: number;
  rule: string;
  message: string;
  value?: string;
  property?: string;
  suggestions?: Suggestion[];
}

/**
 * Lints a code snippet with the design system's style rules, and for each
 * raw value suggests the token to use instead (in the given theme).
 */
export function lintStyles(code: string, theme?: string, scope: LintScope = "app"): LintFinding[] {
  const lines = code.split("\n");
  const findings: LintFinding[] = linter
    .verify(code, configFor(scope), { filename: "snippet.tsx" })
    .map((m) => {
      if (m.fatal) {
        return { line: m.line, column: m.column, rule: "parse-error", message: m.message };
      }
      const raw = /Raw style value (.+?) —/.exec(m.message)?.[1];
      const value = raw?.replace(/^"|"$/g, "");
      // The CSS property is whatever key precedes the value on its line.
      const before = (lines[m.line - 1] ?? "").slice(0, m.column - 1);
      const property = /(\w+)\s*:\s*(?:\{\s*(?:default\s*:\s*)?)?[`"']?[^:]*$/.exec(before)?.[1];
      return {
        line: m.line,
        column: m.column,
        rule: m.ruleId ?? "unknown",
        message: m.message,
        ...(value && { value }),
        ...(value && property && { property }),
        ...(value && { suggestions: findTokens(value, { theme, property, limit: 3 }) }),
      };
    });

  return findings.sort((a, b) => a.line - b.line || a.column - b.column);
}
