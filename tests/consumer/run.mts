/**
 * Consumer test: proves an app team can install and use a release.
 *
 *   pnpm test:consumer                # everything
 *   pnpm test:consumer --skip-smoke   # without the browser test
 *
 * 1. Builds and packs every @dsw/* package as it would be published.
 * 2. Copies templates/starter outside the workspace and installs it from
 *    those packs only (no workspace links, no source files).
 * 3. Runs the starter's typecheck, lint, build and Playwright smoke test.
 * 4. Talks to the packed MCP server over stdio.
 * 5. Runs the dsw-migrate codemod on a legacy screen.
 * 6. Lints a screen that breaks every design-system rule.
 *
 * Set CONSUMER_DIR to choose the scratch folder (default: the OS temp dir).
 */
import { execFileSync, spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const repo = resolve(import.meta.dirname, "../..");
const fixtures = join(import.meta.dirname, "fixtures");
const skipSmoke = process.argv.includes("--skip-smoke");

const base = process.env.CONSUMER_DIR ?? tmpdir();
mkdirSync(base, { recursive: true });
const work = mkdtempSync(join(base, "dsw-consumer-"));
if (resolve(work).startsWith(repo + "/")) {
  throw new Error(`CONSUMER_DIR must be outside the repo: ${work}`);
}
const packs = join(work, "packs");
const app = join(work, "app");

const PACKAGES = ["@dsw/tokens", "@dsw/ui", "@dsw/eslint-plugin", "@dsw/mcp"];

const results: Array<{ step: string; ok: boolean; detail?: string }> = [];

function run(
  cmd: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = {},
): string {
  return execFileSync(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function step(name: string, fn: () => string | void | Promise<string | void>) {
  return async () => {
    process.stdout.write(`• ${name} … `);
    try {
      const detail = (await fn()) ?? undefined;
      results.push({ step: name, ok: true, ...(detail && { detail }) });
      console.log(`ok${detail ? ` (${detail})` : ""}`);
    } catch (error) {
      const e = error as { stdout?: string; stderr?: string; message: string };
      const detail = [e.message, e.stdout, e.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();
      results.push({ step: name, ok: false, detail });
      console.log("FAILED");
      console.log(indent(detail.split("\n").slice(-40).join("\n")));
    }
  };
}

const indent = (s: string) => s.replace(/^/gm, "    ");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// ── 1. Pack ─────────────────────────────────────────────────────────────

const pack = step("Build and pack the @dsw packages", () => {
  run(
    "pnpm",
    [
      "--filter",
      "@dsw/tokens",
      "--filter",
      "@dsw/ui",
      "--filter",
      "@dsw/mcp",
      "build",
    ],
    repo,
  );
  mkdirSync(packs);
  for (const name of PACKAGES) {
    run("pnpm", ["--filter", name, "pack", "--pack-destination", packs], repo);
  }
  const files = readdirSync(packs);
  assert(
    files.length === PACKAGES.length,
    `expected ${PACKAGES.length} packs, got ${files.join(", ")}`,
  );
  // A pack must contain built JS, not workspace source.
  for (const file of files) {
    const listing = run("tar", ["-tzf", join(packs, file)], packs);
    assert(
      !/package\/src\/.*\.tsx?$/m.test(listing),
      `${file} ships TypeScript source`,
    );
  }
  return files.join(", ");
});

// ── 2. Install the starter from the packs ────────────────────────────────

const packFor = (name: string) => {
  const prefix = name.replace("@", "").replace("/", "-") + "-";
  const file = readdirSync(packs).find(
    (f) => f.startsWith(prefix) && /^\d/.test(f.slice(prefix.length)),
  );
  assert(file, `no pack for ${name}`);
  return `file:${join(packs, file)}`;
};

const install = step("Install the starter outside the workspace", () => {
  const tracked = run(
    "git",
    [
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "templates/starter",
    ],
    repo,
  )
    .trim()
    .split("\n");
  for (const file of tracked) {
    const to = join(app, relative("templates/starter", file));
    mkdirSync(resolve(to, ".."), { recursive: true });
    cpSync(join(repo, file), to);
  }
  const pkgPath = join(app, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const overrides: Record<string, string> = {};
  for (const field of ["dependencies", "devDependencies"]) {
    for (const [dep, spec] of Object.entries<string>(pkg[field] ?? {})) {
      if (spec.startsWith("workspace:"))
        pkg[field][dep] = overrides[dep] = packFor(dep);
    }
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  // A standalone project's pnpm settings. The overrides point nested
  // dependencies (@dsw/ui → @dsw/tokens@0.1.0) at the packs too, since
  // they aren't on a registry; esbuild may run its install script.
  const yaml = [
    "allowBuilds:",
    "  esbuild: true",
    "overrides:",
    ...Object.entries(overrides).map(([dep, spec]) => `  "${dep}": "${spec}"`),
  ];
  writeFileSync(join(app, "pnpm-workspace.yaml"), yaml.join("\n") + "\n");
  run(
    "pnpm",
    ["install", "--prefer-offline", "--config.confirmModulesPurge=false"],
    app,
  );
  const ui = JSON.parse(
    readFileSync(join(app, "node_modules/@dsw/ui/package.json"), "utf8"),
  );
  assert(
    ui.exports["."].default === "./dist/index.js",
    "installed @dsw/ui doesn't point at dist",
  );
  return `installed into ${app}`;
});

// ── 3. The starter's own checks ──────────────────────────────────────────

const typecheck = step(
  "Starter: typecheck",
  () => void run("pnpm", ["run", "typecheck"], app),
);
const lint = step(
  "Starter: lint (with @dsw/eslint-plugin)",
  () => void run("pnpm", ["run", "lint"], app),
);
const build = step(
  "Starter: build (StyleX compiles @dsw/ui from node_modules)",
  () => {
    run("pnpm", ["run", "build"], app);
    const css = readdirSync(join(app, "dist/assets")).filter((f) =>
      f.endsWith(".css"),
    );
    const size = css.reduce(
      (n, f) => n + readFileSync(join(app, "dist/assets", f)).length,
      0,
    );
    // The design system's atomic CSS is tens of kB; a few hundred bytes
    // means StyleX skipped the packages.
    assert(
      size > 20_000,
      `only ${size} bytes of CSS: @dsw/ui styles are missing`,
    );
    return `${Math.round(size / 1024)} kB of CSS`;
  },
);
const smoke = step("Starter: smoke test (axe in 6 themes)", () => {
  const out = run("pnpm", ["run", "smoke"], app, { CI: "1" });
  return out.match(/(\d+) passed/)?.[0];
});

// ── 4. MCP server ────────────────────────────────────────────────────────

const mcp = step("MCP server answers over stdio", async () => {
  const server = spawn(join(app, "node_modules/.bin/dsw-mcp"), [], {
    cwd: app,
    stdio: ["pipe", "pipe", "pipe"],
  });
  let buffer = "";
  const pending = new Map<
    number,
    (msg: { result?: unknown; error?: unknown }) => void
  >();
  server.stdout.setEncoding("utf8");
  server.stdout.on("data", (chunk: string) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      const msg = JSON.parse(line);
      pending.get(msg.id)?.(msg);
    }
  });
  let id = 0;
  const call = (method: string, params: object) =>
    new Promise<{ result?: any; error?: unknown }>((done, fail) => {
      const n = ++id;
      const timer = setTimeout(
        () => fail(new Error(`${method} timed out`)),
        15_000,
      );
      pending.set(n, (msg) => (clearTimeout(timer), done(msg)));
      server.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id: n, method, params }) + "\n",
      );
    });
  const tool = async (name: string, args: object) => {
    const { result, error } = await call("tools/call", {
      name,
      arguments: args,
    });
    assert(
      !error && !result.isError,
      `${name} failed: ${JSON.stringify(error ?? result)}`,
    );
    return result.content
      .map((c: { text: string }) => c.text)
      .join("\n") as string;
  };

  try {
    await call("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "dsw-consumer-test", version: "1" },
    });
    server.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
        "\n",
    );

    const { result } = await call("tools/list", {});
    const names = result.tools.map((t: { name: string }) => t.name);
    for (const expected of [
      "get_component",
      "suggest_component",
      "find_token_for_value",
      "check_contrast",
      "lint_styles",
    ]) {
      assert(names.includes(expected), `missing tool ${expected}`);
    }
    assert(
      (await tool("get_component", { name: "ThemeProvider" })).includes(
        "defaultBrand",
      ),
      "get_component lacks ThemeProvider props",
    );
    assert(
      (
        await tool("suggest_component", { need: "a modal to confirm deleting" })
      ).includes("Dialog"),
      "suggest_component didn't suggest Dialog",
    );
    const lintOut = await tool("lint_styles", {
      code: 'const s = stylex.create({ a: { color: "#336699" } });',
    });
    assert(
      /no-raw-style-values/.test(lintOut),
      "lint_styles missed a raw colour",
    );
    return `${names.length} tools`;
  } finally {
    server.kill();
  }
});

// ── 5. Codemod ───────────────────────────────────────────────────────────

const codemod = step(
  "dsw-migrate rewrites the safe cases and lists the rest",
  () => {
    const dir = join(app, "migrate");
    mkdirSync(dir);
    cpSync(join(fixtures, "Legacy.tsx"), join(dir, "Legacy.tsx"));
    const out = run(
      join(app, "node_modules/.bin/dsw-migrate"),
      ["migrate"],
      app,
    );
    const after = readFileSync(join(dir, "Legacy.tsx"), "utf8");
    const imported = after
      .match(/import \{([^}]*)\} from "@dsw\/ui";/)?.[1]
      ?.split(",")
      .map((s) => s.trim())
      .sort();
    assert(
      imported?.join() === "Button,Heading,Link",
      `expected one @dsw/ui import of Button, Heading and Link:\n\n${after}`,
    );
    for (const expected of [
      '<Heading level={2} id="title">',
      '<Link href="https://help.example.com" isExternal>',
      "<Button onPress={() => save()} isDisabled={busy}>",
    ]) {
      assert(
        after.includes(expected),
        `expected the migrated file to contain: ${expected}\n\n${after}`,
      );
    }
    // The styled button whose handler reads the event, and the unlabelled
    // input, must be left for a person.
    assert(
      after.includes('<button className="danger"'),
      "the codemod changed the styled button",
    );
    assert(
      after.includes('<input type="email" />'),
      "the codemod changed the input",
    );
    const manual = out.match(/Legacy\.tsx:\d+/g) ?? [];
    assert(manual.length === 2, `expected 2 cases for a person, got:\n${out}`);
    return "3 rewritten, 2 listed";
  },
);

// ── 6. Lint rules ────────────────────────────────────────────────────────

const rules = step("Lint catches every design-system rule", () => {
  const target = join(app, "src/BadScreen.tsx");
  cpSync(join(fixtures, "BadScreen.tsx"), target);
  let json: string;
  try {
    json = run(
      "pnpm",
      ["exec", "eslint", "src/BadScreen.tsx", "--format", "json"],
      app,
    );
  } catch (error) {
    json = (error as { stdout: string }).stdout; // ESLint exits 1 on findings.
  } finally {
    rmSync(target);
  }
  const found = new Set<string>(
    JSON.parse(json).flatMap(
      (r: { messages: Array<{ ruleId: string | null }> }) =>
        r.messages.map((m) => m.ruleId ?? "parse-error"),
    ),
  );
  const expected = [
    "@dsw/no-raw-style-values",
    "@dsw/no-primitive-tokens",
    "@dsw/no-react-aria-direct",
    "@dsw/prefer-layout-primitives",
    "@dsw/no-inline-style",
    "@dsw/prefer-ds-components",
  ];
  const missing = expected.filter((r) => !found.has(r));
  assert(
    missing.length === 0,
    `not reported: ${missing.join(", ")} (found ${[...found].join(", ")})`,
  );
  return `${expected.length} rules`;
});

// ── Run ──────────────────────────────────────────────────────────────────

console.log(`Consumer test in ${work}\n`);
await pack();
if (results.at(-1)?.ok) {
  await install();
  if (results.at(-1)?.ok) {
    for (const s of [
      typecheck,
      lint,
      build,
      ...(skipSmoke ? [] : [smoke]),
      mcp,
      codemod,
      rules,
    ])
      await s();
  }
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} passed` +
    (skipSmoke ? " (smoke test skipped)" : "") +
    (failed.length ? `. Failed: ${failed.map((f) => f.step).join("; ")}` : ""),
);
if (!failed.length && !process.env.KEEP_CONSUMER_DIR && existsSync(work)) {
  rmSync(work, { recursive: true, force: true });
} else {
  console.log(`Left ${work} for inspection.`);
}
process.exit(failed.length ? 1 : 0);
