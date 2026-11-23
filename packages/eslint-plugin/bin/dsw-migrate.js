#!/usr/bin/env node
/**
 * dsw-migrate: move an app onto @dsw/ui.
 *
 *   npx dsw-migrate src            # rewrite safe cases, list the rest
 *   npx dsw-migrate src --dry-run  # report only, change nothing
 *
 * Rewrites the native elements that convert without changing behaviour
 * (see rules/prefer-ds-components.js) and adds the @dsw/ui imports. Every
 * case that needs a decision is listed with its file and line, so the
 * remaining work is a checklist, not a search.
 */
import { relative } from "node:path";
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import plugin from "../index.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const targets = args.filter((a) => !a.startsWith("--"));

if (targets.length === 0 || args.includes("--help")) {
  console.log("Usage: dsw-migrate <files or directories…> [--dry-run]");
  process.exit(targets.length === 0 ? 1 : 0);
}

const eslint = new ESLint({
  overrideConfigFile: true,
  fix: !dryRun,
  overrideConfig: [
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
        sourceType: "module",
      },
      plugins: { "@dsw": plugin },
      rules: { "@dsw/prefer-ds-components": ["error", { fix: true }] },
    },
  ],
});

const results = await eslint.lintFiles(targets);
if (!dryRun) await ESLint.outputFixes(results);

const changed = results.filter((r) => r.output !== undefined);
const remaining = results.flatMap((r) =>
  r.messages.map((m) => ({ file: relative(process.cwd(), r.filePath), ...m })),
);
const fixable = dryRun ? remaining.filter((m) => m.fix) : [];

if (dryRun) {
  console.log(`Would rewrite ${fixable.length} element(s) automatically.`);
} else {
  console.log(`Rewrote ${changed.length} file(s).`);
  for (const r of changed) console.log(`  ✓ ${relative(process.cwd(), r.filePath)}`);
}

const manual = remaining.filter((m) => !dryRun || !m.fix);
if (manual.length) {
  console.log(`\n${manual.length} need a person (styling, spread props or event handlers):`);
  for (const m of manual) console.log(`  ${m.file}:${m.line}:${m.column}  ${m.message}`);
} else {
  console.log("\nNothing left to migrate by hand.");
}
