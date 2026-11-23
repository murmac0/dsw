import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../src/server.ts";

/** Talks to the server exactly as an MCP client (Claude Code, Cursor) would. */
let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  client = new Client({ name: "test", version: "0" });
  await client.connect(clientSide);
});
afterAll(() => client.close());

async function call(name: string, args: Record<string, unknown> = {}) {
  const res = await client.callTool({ name, arguments: args });
  const content = res.content as Array<{ type: string; text: string }>;
  return { text: content.map((c) => c.text).join("\n"), isError: res.isError === true };
}

describe("dsw MCP server", () => {
  it("advertises its tools, all read-only, and a workflow in its instructions", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "check_contrast",
      "find_token_for_value",
      "get_component",
      "get_guidelines",
      "get_token",
      "lint_styles",
      "list_brands",
      "list_components",
      "search_tokens",
      "suggest_component",
    ]);
    for (const t of tools) expect(t.annotations?.readOnlyHint, t.name).toBe(true);
    expect(client.getInstructions()).toMatch(/lint_styles/);
  });

  it("lists every @dsw/ui component", async () => {
    const { text } = await call("list_components");
    for (const name of ["Button", "TextField", "Select", "CheckboxGroup", "Fieldset", "Dialog"]) {
      expect(text).toContain(`- ${name}`);
    }
  });

  it("describes a component with literal prop types, tokens, contrast pairs and stories", async () => {
    const { text } = await call("get_component", { name: "button" });
    expect(text).toContain('import { Button } from "@dsw/ui";');
    expect(text).toContain('variant?: "primary" | "secondary" | "ghost" | "danger"');
    expect(text).toContain("`buttonTokens`");
    expect(text).toMatch(/Primary label: buttonTokens\.primaryFg on buttonTokens\.primaryBg/);
    expect(text).toContain("components-button--primary");
  });

  it("maps product language to components, and admits gaps", async () => {
    const modal = await call("suggest_component", { need: "a modal to confirm deleting the workspace" });
    expect(modal.text.split("\n")[1]).toMatch(/^- Dialog:/);
    expect(modal.text).toContain('import { Dialog } from "@dsw/ui";');

    const pill = await call("suggest_component", { need: "status pill next to the title" });
    expect(pill.text).toMatch(/- Badge:/);
    expect(pill.text).toMatch(/- Inline:/);

    const tooltip = await call("suggest_component", { need: "tooltip on the icon" });
    expect(tooltip.text).toMatch(/^Not in @dsw\/ui yet: Tooltip\./);
  });

  it("errors helpfully for an unknown component", async () => {
    const res = await call("get_component", { name: "Tooltip" });
    expect(res.isError).toBe(true);
    expect(res.text).toMatch(/Available: .*Button/);
  });

  it("searches tokens and returns values for the requested theme", async () => {
    const { text } = await call("search_tokens", { query: "muted", group: "color", theme: "volt/dark" });
    expect(text).toContain("color.fgMuted = #b4b2a7");
    expect(text).toContain('from "@dsw/tokens/semantic.stylex"');
  });

  it("explains one token across themes, aliases and variants", async () => {
    const primary = await call("get_token", { ref: "buttonTokens.primaryBorder" });
    expect(primary.text).toMatch(/volt\/light: #0a0a0a\s+\(→ color\.borderStrong\)/);
    const control = await call("get_token", { ref: "size.controlMd" });
    expect(control.text).toMatch(/@media \(pointer: coarse\): 44px/);
  });

  it("maps a raw value to the right token, using the CSS property as intent", async () => {
    const bg = await call("find_token_for_value", { value: "#6a58ee", property: "backgroundColor" });
    expect(bg.text.split("\n")[1]).toContain("EXACT color.accentDefault");
    const pad = await call("find_token_for_value", { value: "12px", property: "paddingInline" });
    expect(pad.text).toContain("EXACT space.md");
    expect(pad.text).not.toMatch(/radius/i);
  });

  it("checks contrast for token pairs across every theme and knows the audited list", async () => {
    const ok = await call("check_contrast", { foreground: "color.fgMuted", background: "color.bgSurface" });
    expect(ok.text.match(/text PASS/g)).toHaveLength(6);
    expect(ok.text).toMatch(/Audited as: Text \/ Muted on surface/);

    const bad = await call("check_contrast", { foreground: "#aaaaaa", background: "#ffffff" });
    expect(bad.text).toMatch(/FAILS AA|NOT for text/);
  });

  it("lints raw style values and suggests exact tokens", async () => {
    const { text } = await call("lint_styles", {
      code: [
        'import * as stylex from "@stylexjs/stylex";',
        'import { colorPrimitives } from "@dsw/tokens/primitives.stylex";',
        'const styles = stylex.create({ card: { padding: "12px", color: "#5e5e70", fontWeight: 600 } });',
      ].join("\n"),
    });
    expect(text).toMatch(/padding: Raw style value "12px"[\s\S]*try: space\.md \(exact\)/);
    expect(text).toMatch(/color: Raw style value "#5e5e70"[\s\S]*try: color\.fgMuted \(exact\)/);
    expect(text).toMatch(/fontWeight: Raw style value 600[\s\S]*fontWeight\.semibold \(exact\)/);
    expect(text).toContain("@dsw/no-primitive-tokens");
  });

  it("in app code, prefers @dsw/ui components and layout primitives over hand-rolled ones", async () => {
    const { text } = await call("lint_styles", {
      code: [
        'import { Tabs } from "react-aria-components";',
        'const s = stylex.create({ list: { display: "flex", flexDirection: "column", gap: space.md } });',
        "export const A = () => <h2>Members</h2>;",
      ].join("\n"),
    });
    expect(text).toContain("@dsw/no-react-aria-direct");
    expect(text).toMatch(/hand-written Stack/);
    expect(text).toMatch(/Use <Heading> from @dsw\/ui instead of <h2>/);
  });

  it("in library scope (inside @dsw/ui), checks tokens only", async () => {
    const { text } = await call("lint_styles", {
      scope: "library",
      code: 'import { Button as AriaButton } from "react-aria-components";\nexport const B = () => <button />;',
    });
    expect(text).toMatch(/No findings/);
  });

  it("passes clean code and honours token-exempt", async () => {
    const { text } = await call("lint_styles", {
      code: [
        'import { space } from "@dsw/tokens/semantic.stylex";',
        "const s = stylex.create({",
        "  a: { padding: space.md, width: \"100%\" },",
        '  b: { width: "1px" }, // token-exempt: visually-hidden technique',
        "});",
      ].join("\n"),
    });
    expect(text).toMatch(/No findings/);
  });

  it("describes brands and how to apply them", async () => {
    const { text } = await call("list_brands");
    expect(text).toMatch(/Volt \(`volt`\): Neo-brutalist/);
    expect(text).toContain("themes[brand][mode]");
  });

  it("returns the relevant guideline sections", async () => {
    const { text } = await call("get_guidelines", { topic: "forced colours" });
    expect(text).toMatch(/Forced colours|forced-colours|forced colours/i);
  });

  it("serves manifests, DTCG files and docs as resources", async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    expect(uris).toEqual(
      expect.arrayContaining(["dsw://components", "dsw://tokens", "dsw://docs/accessibility", "dsw://tokens/volt/dark"]),
    );
    const dtcg = await client.readResource({ uri: "dsw://tokens/volt/dark" });
    const body = JSON.parse((dtcg.contents[0] as { text: string }).text) as {
      color: { accentDefault: { $type: string; $value: { hex: string } } };
    };
    expect(body.color.accentDefault.$type).toBe("color");
    expect(body.color.accentDefault.$value.hex).toBe("#d4ff3a");
  });
});

describe("stdio entry point", () => {
  it("boots under plain Node and answers over stdio", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL("../src/stdio.ts", import.meta.url))],
      stderr: "ignore",
    });
    const c = new Client({ name: "stdio-test", version: "0" });
    await c.connect(transport);
    const { tools } = await c.listTools();
    expect(tools.length).toBe(10);
    await c.close();
  });
});
