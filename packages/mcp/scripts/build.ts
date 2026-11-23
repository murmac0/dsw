/**
 * Builds the publishable server: dist/stdio.js (the `dsw-mcp` bin) and
 * dist/server.js, with workspace code (@dsw/eslint-plugin, the colour
 * maths) bundled in and the design-system data copied to dist/data.
 * Runtime dependencies stay external: the MCP SDK, zod and ESLint.
 *
 * Usage: node scripts/build.ts
 */
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(root, "../..");
const dist = join(root, "dist");
const data = join(dist, "data");

rmSync(dist, { recursive: true, force: true });

await build({
  entryPoints: [join(root, "src/stdio.ts"), join(root, "src/server.ts")],
  outdir: dist,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "node",
  target: "node22",
  external: ["@modelcontextprotocol/sdk", "zod", "eslint", "typescript-eslint"],
  logLevel: "warning",
});

mkdirSync(join(data, "dtcg"), { recursive: true });
cpSync(join(repo, "packages/tokens/generated/tokens.json"), join(data, "tokens.json"));
cpSync(join(repo, "packages/tokens/generated/dtcg"), join(data, "dtcg"), { recursive: true });
cpSync(join(repo, "packages/ui/generated/components.json"), join(data, "components.json"));
for (const doc of ["ARCHITECTURE.md", "ACCESSIBILITY.md"]) cpSync(join(repo, doc), join(data, doc));

console.log(`Built ${dist}`);
