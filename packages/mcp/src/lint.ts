import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import noRawStyleValues from "@dsw/eslint-config/no-raw-style-values";
import { findTokens, type Suggestion } from "./tokens.ts";

const linter = new Linter({ configType: "flat" });

const config: Linter.Config[] = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      sourceType: "module",
      ecmaVersion: "latest",
    },
    plugins: { dsw: { rules: { "no-raw-style-values": noRawStyleValues } } },
    rules: { "dsw/no-raw-style-values": "error" },
  },
];

export interface LintFinding {
  line: number;
  column: number;
  rule: string;
  message: string;
  value?: string;
  property?: string;
  suggestions?: Suggestion[];
}

/** Design-system rules the ESLint rule can't express (imports, not values). */
const IMPORT_RULES: Array<{ test: RegExp; rule: string; message: string }> = [
  {
    test: /from\s+["']@dsw\/tokens\/primitives\.stylex["']/,
    rule: "dsw/no-primitive-imports",
    message:
      "Components must not use primitive tokens directly. Use semantic tokens (@dsw/tokens/semantic.stylex) or the component's tokens (@dsw/tokens/components.stylex); primitives aren't contrast-audited and don't follow the theme.",
  },
  {
    test: /from\s+["']@dsw\/tokens["'];?\s*$/m,
    rule: "dsw/no-token-barrel",
    message:
      "Import tokens from their origin file (e.g. @dsw/tokens/semantic.stylex), not the package root: StyleX can't trace defineVars() through a re-export barrel.",
  },
  {
    test: /style=\{\{/,
    rule: "dsw/no-inline-style",
    message:
      "Avoid inline style objects: they bypass tokens and conflict with stylex.props(). Use stylex.create(), with a style function for runtime values.",
  },
];

/**
 * Lints a code snippet with the design system's style rules, and for each
 * raw value suggests the token to use instead (in the given theme).
 */
export function lintStyles(code: string, theme?: string): LintFinding[] {
  const lines = code.split("\n");
  const findings: LintFinding[] = linter
    .verify(code, config, { filename: "snippet.tsx" })
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
        ...(property && { property }),
        ...(value && { suggestions: findTokens(value, { theme, property, limit: 3 }) }),
      };
    });

  lines.forEach((text, i) => {
    for (const r of IMPORT_RULES) {
      if (r.test.test(text)) findings.push({ line: i + 1, column: 1, rule: r.rule, message: r.message });
    }
  });
  return findings.sort((a, b) => a.line - b.line || a.column - b.column);
}
