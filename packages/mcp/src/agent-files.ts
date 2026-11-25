import { components, tokens } from "./data.ts";

/**
 * Checks that agent instructions (AGENTS.md, CLAUDE.md, skills) only name
 * things that exist. Agents follow these files faithfully, so a renamed
 * component or a removed prop value left in them becomes a build error in
 * generated code: stale docs are a hallucination source.
 *
 * It reads code in backticks and fenced blocks, and checks:
 * - components: `<Card …>`, `Card`, `Alert announce`
 * - props on them, and literal values for props with a literal-union type
 * - token references: `space.lg`, `buttonTokens.primaryBorder`
 * - MCP tool names: `get_component`
 */

export interface AgentFileProblem {
  file: string;
  line: number;
  problem: string;
}

export interface AgentFileReport {
  /** How many references were checked, by kind. */
  checked: {
    components: number;
    props: number;
    values: number;
    tokens: number;
    tools: number;
  };
  problems: AgentFileProblem[];
}

/** PascalCase names that legitimately appear and aren't @dsw/ui exports. */
const NOT_DSW = new Set([
  // Forced-colours system colours.
  "Canvas",
  "CanvasText",
  "Highlight",
  "HighlightText",
  "GrayText",
  "ButtonText",
  // Platform and library types.
  "MouseEvent",
  "PressEvent",
  "ReactNode",
  "RuleTester",
  "Linter",
]);

/** Props every component accepts without listing them. */
const UNIVERSAL_PROP =
  /^(key|ref|children|className|style|id|aria-[\w-]+|data-[\w-]+)$/;

const byName = new Map(components.components.map((c) => [c.name, c]));
const tokenRefs = new Set(tokens.tokens.map((t) => t.ref));
const tokenGroups = new Set(tokens.tokens.map((t) => t.group));

/** Code spans and fenced blocks, with the line each starts on. */
function codeIn(
  markdown: string,
): Array<{ code: string; line: number; fenced: boolean }> {
  const out: Array<{ code: string; line: number; fenced: boolean }> = [];
  const lines = markdown.split("\n");
  let fence: { start: number; body: string[] } | null = null;
  lines.forEach((text, i) => {
    if (/^\s*```/.test(text)) {
      if (fence) {
        out.push({
          code: fence.body.join("\n"),
          line: fence.start + 1,
          fenced: true,
        });
        fence = null;
      } else fence = { start: i + 1, body: [] };
      return;
    }
    if (fence) {
      fence.body.push(text);
      return;
    }
    for (const m of text.matchAll(/`([^`]+)`/g))
      out.push({ code: m[1]!, line: i + 1, fenced: false });
  });
  return out;
}

/** Literal options of a prop's type, if it's a union of string/number literals. */
function literalOptions(type: string): string[] | null {
  const parts = type.split("|").map((p) => p.trim());
  if (
    !parts.every((p) => /^("[^"]*"|'[^']*'|-?\d+(\.\d+)?|undefined)$/.test(p))
  )
    return null;
  return parts
    .filter((p) => p !== "undefined")
    .map((p) => p.replace(/^["']|["']$/g, ""));
}

export interface AgentFile {
  file: string;
  text: string;
  /**
   * "library" for instructions to the design-system team (adding a
   * component), where bare names in backticks are placeholders, story
   * names or internal parts. Only JSX tags are checked there.
   */
  audience?: "app" | "library";
}

export function checkAgentFiles(
  files: AgentFile[],
  toolNames: readonly string[],
): AgentFileReport {
  const checked = { components: 0, props: 0, values: 0, tokens: 0, tools: 0 };
  const problems: AgentFileProblem[] = [];
  const tools = new Set(toolNames);

  for (const { file, text, audience = "app" } of files) {
    const report = (line: number, problem: string) =>
      problems.push({ file, line, problem });

    const checkTag = (name: string, attrs: string, line: number) => {
      const entry = byName.get(name);
      if (!entry) {
        if (!NOT_DSW.has(name))
          report(line, `<${name}> isn't exported by @dsw/ui`);
        return;
      }
      checked.components++;
      for (const a of attrs.matchAll(
        /([A-Za-z][\w-]*)(?:=("([^"]*)"|\{[^}]*\}))?/g,
      )) {
        const [, prop, , value] = a;
        if (UNIVERSAL_PROP.test(prop!)) continue;
        const def = entry.props.find((p) => p.name === prop);
        checked.props++;
        if (!def) {
          report(line, `${name} has no prop "${prop}"`);
          continue;
        }
        if (value !== undefined) {
          const options = literalOptions(def.type);
          if (options) {
            checked.values++;
            if (!options.includes(value)) {
              report(
                line,
                `${name} ${prop}="${value}" isn't one of ${options.map((o) => `"${o}"`).join(", ")}`,
              );
            }
          }
        }
      }
    };

    for (const { code, line, fenced } of codeIn(text)) {
      // JSX tags anywhere in code.
      for (const m of code.matchAll(/<([A-Z]\w*)((?:\s+[^<>]*?)?)\s*\/?>/g)) {
        const before = code.slice(0, m.index);
        checkTag(m[1]!, m[2] ?? "", line + (before.match(/\n/g)?.length ?? 0));
      }
      if (fenced) continue;
      const span = code.trim();
      // "Card", "Alert announce", "Stack gap=\"xl\"": a component and its props.
      const shorthand = span.match(
        /^([A-Z]\w*)((?:\s+[a-z][\w-]*(?:="[^"]*")?)*)$/,
      );
      if (shorthand) {
        if (audience === "app" || shorthand[2])
          checkTag(shorthand[1]!, shorthand[2] ?? "", line);
        continue;
      }
      // Token references: group.key, where group is a token group.
      const ref = span.match(/^([a-z]\w*)\.([a-z]\w*)$/i);
      if (ref && tokenGroups.has(ref[1]!)) {
        checked.tokens++;
        if (!tokenRefs.has(span)) report(line, `token ${span} doesn't exist`);
        continue;
      }
      // MCP tool names.
      if (/^(get|search|find|check|suggest|lint|list)_[a-z_]+$/.test(span)) {
        checked.tools++;
        if (!tools.has(span)) report(line, `MCP tool ${span} doesn't exist`);
      }
    }
  }
  return { checked, problems };
}
