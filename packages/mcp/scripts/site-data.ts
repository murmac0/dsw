/**
 * Data for the workbench's "AI-ready" page, produced by the real server
 * and the real agent files, so the page can't drift from either:
 * - the server's tools and example calls with their actual answers
 * - every agent file with its size, grouped by when agents load it
 * - what the agent-files check verified
 * - an example per lint rule, run through the linter: the "flagged" code
 *   must trip that rule and the "instead" code must pass every rule
 *
 * Usage: node scripts/site-data.ts [--check]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import dsw from "@dsw/eslint-plugin";
import { checkAgentFiles } from "../src/agent-files.ts";
import { lintStyles } from "../src/lint.ts";
import { createServer } from "../src/server.ts";
import { agentFiles, repo } from "./agent-file-list.ts";

const out = join(import.meta.dirname, "../generated/site.json");

const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
await createServer().connect(serverSide);
const client = new Client({ name: "site-data", version: "0" });
await client.connect(clientSide);

const { tools } = await client.listTools();

/** Questions an agent asks while building a screen, in the order it would. */
const EXAMPLES: Array<{
  ask: string;
  tool: string;
  args: Record<string, unknown>;
  maxLines?: number;
}> = [
  {
    ask: "What do I use for a confirmation before deleting?",
    tool: "suggest_component",
    args: { need: "a modal to confirm deleting a project" },
  },
  {
    ask: "Is there a tooltip?",
    tool: "suggest_component",
    args: { need: "a tooltip on an icon button" },
  },
  {
    ask: "Which props does Badge take?",
    tool: "get_component",
    args: { name: "Badge" },
    maxLines: 11,
  },
  {
    ask: "The design says #6a58ee for this background. Which token is that?",
    tool: "find_token_for_value",
    args: { value: "#6a58ee", property: "backgroundColor" },
    maxLines: 6,
  },
  {
    ask: "Is muted text readable on a raised surface in every theme?",
    tool: "check_contrast",
    args: { foreground: "color.fgMuted", background: "color.bgSurface" },
  },
  {
    ask: "Does the code I just wrote follow the rules?",
    tool: "lint_styles",
    args: {
      code: [
        'import { colorPrimitives } from "@dsw/tokens/primitives.stylex";',
        "const styles = stylex.create({",
        '  row: { display: "flex", gap: "16px" },',
        "  title: { color: colorPrimitives.iris500 },",
        "});",
      ].join("\n"),
    },
  },
];

const examples = [];
for (const { ask, tool, args, maxLines = 12 } of EXAMPLES) {
  const res = await client.callTool({ name: tool, arguments: args });
  if (res.isError)
    throw new Error(`${tool} failed: ${JSON.stringify(res.content)}`);
  const lines = (res.content as Array<{ text: string }>)
    .map((c) => c.text)
    .join("\n")
    .trim()
    .split("\n");
  examples.push({
    ask,
    tool,
    args,
    response: lines.slice(0, maxLines).join("\n"),
    truncated: lines.length > maxLines ? lines.length - maxLines : 0,
  });
}
await client.close();

/**
 * One example per lint rule: code the rule flags, and the on-system way to
 * write it. Both are linted below, so an example can't show something the
 * rule doesn't do (or a "fix" another rule would flag).
 */
const RULE_EXAMPLES: Record<string, { flagged: string; instead: string }> = {
  "no-raw-style-values": {
    flagged: `const styles = stylex.create({
  title: { color: "#6a58ee", marginBottom: "12px" },
});`,
    instead: `import { color, space } from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  title: { color: color.accentDefault, marginBottom: space.md },
});`,
  },
  "no-primitive-tokens": {
    flagged: `import { colorPrimitives } from "@dsw/tokens/primitives.stylex";

const styles = stylex.create({
  link: { color: colorPrimitives.iris600 },
});`,
    instead: `import { color } from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  link: { color: color.fgAccent },
});`,
  },
  "no-token-barrel": {
    flagged: `import { color } from "@dsw/tokens";`,
    instead: `import { color } from "@dsw/tokens/semantic.stylex";`,
  },
  "no-inline-style": {
    flagged: `<Text style={{ marginTop: 8, color: "gray" }}>Saved</Text>`,
    instead: `<Stack gap="xs">
  <Heading level={2}>Billing</Heading>
  <Text tone="muted">Saved</Text>
</Stack>`,
  },
  "prefer-ds-components": {
    flagged: `<button onClick={save}>Save</button>`,
    instead: `<Button onPress={save}>Save</Button>`,
  },
  "no-react-aria-direct": {
    flagged: `import { Button } from "react-aria-components";`,
    instead: `import { Button } from "@dsw/ui";`,
  },
  "prefer-layout-primitives": {
    flagged: `import { space } from "@dsw/tokens/semantic.stylex";

const styles = stylex.create({
  row: { display: "flex", gap: space.md },
});`,
    instead: `<Inline gap="md">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Inline>`,
  },
};

function ruleExample(id: string) {
  const example = RULE_EXAMPLES[id];
  if (!example) throw new Error(`No example for @dsw/${id}: add one to RULE_EXAMPLES`);
  const flagged = lintStyles(example.flagged).filter((f) => f.rule === `@dsw/${id}`);
  if (flagged.length === 0)
    throw new Error(`@dsw/${id}'s "flagged" example doesn't trip the rule`);
  const leftover = lintStyles(example.instead);
  if (leftover.length > 0)
    throw new Error(
      `@dsw/${id}'s "instead" example fails lint: ${leftover.map((f) => `${f.rule} ${f.message}`).join("; ")}`,
    );
  return { ...example, message: flagged[0]!.message };
}

/** Up to the first full stop that ends a sentence (not "e.g." or "i.e."). */
const firstSentence = (text: string) => {
  const end = text.search(/(?<!\b(?:e\.g|i\.e))\.(?=\s+[A-Z"]|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
};

const files = agentFiles();
const describe = (file: string, text: string) => {
  const words = text.split(/\s+/).filter(Boolean).length;
  // ~4 characters per token is the usual estimate for English prose.
  return { file, words, tokens: Math.round(text.length / 4) };
};
const read = (file: string) => readFileSync(join(repo, file), "utf8");
const report = checkAgentFiles(
  files,
  tools.map((t) => t.name),
);

const data = {
  $comment: "Generated by packages/mcp/scripts/site-data.ts. Do not edit.",
  tools: tools.map((t) => ({
    name: t.name,
    description: firstSentence(t.description ?? ""),
  })),
  examples,
  agentFiles: {
    // CLAUDE.md imports AGENTS.md, so Claude Code loads both every turn.
    alwaysOn: ["AGENTS.md", "CLAUDE.md"].map((f) => describe(f, read(f))),
    onDemand: files
      .filter((f) => f.file.endsWith("SKILL.md"))
      .map((f) => ({
        ...describe(f.file, f.text),
        audience: f.audience,
        description: firstSentence(
          f.text.match(/^description:\s*(.+)$/m)?.[1] ?? "",
        ),
      })),
    starter: ["templates/starter/AGENTS.md", "templates/starter/CLAUDE.md"].map(
      (f) => describe(f, read(f)),
    ),
  },
  // The rules CI, editors and the MCP server's lint_styles all run.
  rules: Object.entries(dsw.rules).map(([id, rule]) => ({
    id: `@dsw/${id}`,
    description:
      (rule as { meta?: { docs?: { description?: string } } }).meta?.docs
        ?.description ?? "",
    level:
      (dsw.configs.recommended.rules?.[`@dsw/${id}`] as string | undefined) ??
      "library only",
    library: `@dsw/${id}` in (dsw.configs.library.rules ?? {}),
    example: ruleExample(id),
  })),
  check: {
    files: files.length,
    checked: report.checked,
    problems: report.problems.length,
  },
};

const json = JSON.stringify(data, null, 2) + "\n";
if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(out, "utf8");
  } catch {
    /* missing */
  }
  if (current !== json) {
    console.error(
      "packages/mcp/generated/site.json is out of date: run pnpm --filter @dsw/mcp site-data",
    );
    process.exit(1);
  }
} else {
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, json);
  console.log(
    `Wrote ${examples.length} examples and ${files.length} agent files → generated/site.json`,
  );
}
