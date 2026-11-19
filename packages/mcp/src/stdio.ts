#!/usr/bin/env node
/**
 * Entry point for MCP clients (Claude Code, Cursor, …) over stdio:
 *   node packages/mcp/src/stdio.ts
 * Runs on Node ≥ 22.18 / 24 with built-in TypeScript type stripping.
 * stdout is the protocol channel, so log only to stderr.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";

const server = createServer();
await server.connect(new StdioServerTransport());
console.error("dsw design-system MCP server ready (stdio)");
