import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { AgentFile } from "../src/agent-files.ts";

export const repo = resolve(import.meta.dirname, "../../..");

const skills = (dir: string) =>
  readdirSync(join(repo, dir)).map((name) => `${dir}/${name}/SKILL.md`);

/**
 * Every file an agent reads as instructions, in this repo and the starter.
 * "library" files are for the design-system team; "app" files for teams
 * building on it.
 */
export function agentFiles(): Array<
  AgentFile & { audience: "app" | "library" }
> {
  const read = (file: string, audience: "app" | "library") => ({
    file,
    text: readFileSync(join(repo, file), "utf8"),
    audience,
  });
  return [
    ...["AGENTS.md", "CLAUDE.md", ...skills(".claude/skills")].map((f) =>
      read(f, "library"),
    ),
    ...[
      "templates/starter/AGENTS.md",
      "templates/starter/CLAUDE.md",
      "plugins/dsw/README.md",
      ...skills("plugins/dsw/skills"),
    ].map((f) => read(f, "app")),
  ];
}
