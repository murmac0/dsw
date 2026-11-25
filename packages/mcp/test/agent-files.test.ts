import { describe, expect, it } from "vitest";
import { checkAgentFiles } from "../src/agent-files.ts";
import { agentFiles } from "../scripts/agent-file-list.ts";
import { createServer } from "../src/server.ts";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

/** The server's tools, listed the way any MCP client sees them. */
export async function toolNames(): Promise<string[]> {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  const client = new Client({ name: "agent-files", version: "0" });
  await client.connect(clientSide);
  const { tools } = await client.listTools();
  await client.close();
  return tools.map((t) => t.name);
}

describe("agent files", () => {
  it("only name components, props, values, tokens and tools that exist", async () => {
    const { checked, problems } = checkAgentFiles(
      agentFiles(),
      await toolNames(),
    );
    expect(problems.map((p) => `${p.file}:${p.line} ${p.problem}`)).toEqual([]);
    // Guard against the check silently matching nothing.
    expect(checked.components).toBeGreaterThan(20);
    expect(checked.tools).toBeGreaterThan(5);
  });

  it("catches a stale name, prop, value, token and tool", async () => {
    const stale = [
      'Use `<Card tone="warning" heading="x">`, `Toast`, `space.huge` and `get_widget`.',
    ].join("\n");
    const { problems } = checkAgentFiles(
      [{ file: "stale.md", text: stale }],
      await toolNames(),
    );
    expect(problems.map((p) => p.problem)).toEqual([
      'Card tone="warning" isn\'t one of "default", "danger"',
      'Card has no prop "heading"',
      "<Toast> isn't exported by @dsw/ui",
      "token space.huge doesn't exist",
      "MCP tool get_widget doesn't exist",
    ]);
  });
});
