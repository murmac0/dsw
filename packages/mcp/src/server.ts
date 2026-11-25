import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { components, DEFAULT_THEME, docs, dtcgFor, tokenByRef, tokens } from "./data.ts";
import { findGuidelines, sections } from "./guidelines.ts";
import { lintStyles } from "./lint.ts";
import { suggestComponents } from "./suggest.ts";
import { assertTheme, contrastReport, findTokens, searchTokens, tokenLine } from "./tokens.ts";

const INSTRUCTIONS = `You're working in the @dsw design system (React + StyleX + React Aria). Follow this workflow when building or changing UI:

1. Use existing components. Not sure which? suggest_component maps a need ("a modal", "status pill") to one. Call get_component before using one: it gives real prop types, controlled/uncontrolled pairs, accessibility rules and the stories that show it. Build screens from components alone: Container, Stack, Inline and Grid for layout (gaps from the spacing scale), Heading (pick its level from the page outline) and Text for type, Card for sections. Needing stylex.create() in app code usually means a component is missing.
2. Style with tokens only. Never hardcode colours, px, ms, font weights or z-indexes in stylex.create(). Find tokens with search_tokens, or turn a value from a design into a token with find_token_for_value. Import tokens from their origin file (e.g. @dsw/tokens/semantic.stylex), never primitives.
3. Don't invent colour pairings. A new foreground/background combination must pass check_contrast (4.5:1 text, 3:1 boundaries and indicators) in every theme; audited pairs are listed in get_token.
4. Before finishing, run lint_styles on every file you changed that calls stylex.create(), and fix all findings.
5. Accessibility is non-negotiable: every field has a visible label; group related fields with Fieldset; personal-data inputs need autoComplete; states shown only by a fill need a forced-colours treatment. See get_guidelines("accessibility").
6. Themes: 3 brands (iris, volt, bloom) × light/dark. Values differ per theme, so reason with token names, not hex values.

If a Storybook MCP server is also available, use it to preview stories after visual changes.`;

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const themeArg = z
  .string()
  .optional()
  .describe(`Brand/mode, one of: ${tokens.themes.join(", ")}. Default ${DEFAULT_THEME}.`);

export function createServer(): McpServer {
  const server = new McpServer(
    { name: "dsw-design-system", version: "0.1.0" },
    { instructions: INSTRUCTIONS },
  );
  const readOnly = { readOnlyHint: true, openWorldHint: false } as const;

  /* ---------------- Components ---------------- */

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description: "Every export of @dsw/ui with a one-line summary.",
      annotations: readOnly,
    },
    async () =>
      text(
        components.components
          .map((c) => `- ${c.name}${c.kind === "hook" ? " (hook)" : ""}: ${(c.description ?? "").split(/(?<=\.)\s/)[0]}`)
          .join("\n"),
      ),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component",
      description:
        "Full reference for one @dsw/ui export: description and usage rules, import line, props with types, the token groups it paints with, its audited contrast pairs, Storybook story ids and tests.",
      inputSchema: { name: z.string().describe('Component name, e.g. "TextField"') },
      annotations: readOnly,
    },
    async ({ name }) => {
      const c = components.components.find((x) => x.name.toLowerCase() === name.toLowerCase());
      if (!c) {
        return {
          ...text(`No component "${name}". Available: ${components.components.map((x) => x.name).join(", ")}`),
          isError: true,
        };
      }
      const props = c.props
        .map(
          (p) =>
            `- \`${p.name}${p.required ? "" : "?"}: ${p.type}\`${p.from === "@dsw/ui" ? "" : ` _(from ${p.from})_`}${p.description ? ` — ${p.description.replace(/\n/g, " ")}` : ""}`,
        )
        .join("\n");
      const groups = c.tokenGroups ?? [];
      const pairs = tokens.contrast.filter((p) =>
        groups.some((g) => p.fg.startsWith(`${g}.`) || p.bg.startsWith(`${g}.`)),
      );
      return text(
        [
          `# ${c.name}`,
          c.import,
          c.description ?? "",
          props && `## Props\n${props}${c.inheritedProps ? `\n\n${c.inheritedProps}` : ""}`,
          groups.length > 0 &&
            `## Tokens\nPaints with ${groups.map((g) => `\`${g}\``).join(", ")} (@dsw/tokens/components.stylex). Restyle per brand by overriding these in a theme, not in the component.`,
          pairs.length > 0 &&
            `## Audited contrast pairs\n${pairs.map((p) => `- ${p.usage}: ${p.fg} on ${p.bg} — min ${Math.min(...Object.values(p.ratios))}:1 across themes (needs ${p.min}:1)`).join("\n")}`,
          c.stories?.length &&
            `## Stories\n${c.stories.map((s) => `- ${s.name}: \`${s.id}\``).join("\n")}`,
          c.tests?.length && `## Tests\n${c.tests.map((t) => `- ${t}`).join("\n")}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
    },
  );

  server.registerTool(
    "suggest_component",
    {
      title: "Suggest a component",
      description:
        'Which @dsw/ui component to use for a need, in plain words or as markup: "a modal to confirm deleting", "status pill", "row of buttons", "<h2>", "settings panel". Also says when the system has nothing for it yet (tooltip, table, toast…) and what to use meanwhile, so you flag the gap instead of hand-building a one-off.',
      inputSchema: { need: z.string().describe("What the UI needs to do or show, or the element you'd otherwise write") },
      annotations: readOnly,
    },
    async ({ need }) => {
      const { suggestions, missing } = suggestComponents(need);
      const lines: string[] = [];
      for (const m of missing) {
        lines.push(
          `Not in @dsw/ui yet: ${m.name}. Meanwhile: ${m.meanwhile}. Don't hand-build one; tell the user it's a gap for the design-system team.`,
        );
      }
      if (suggestions.length) {
        if (missing.length) lines.push("");
        lines.push(missing.length ? "Closest components:" : "Use:");
        for (const { component: c } of suggestions) {
          const summary = (c.description ?? "").replace(/\s+/g, " ").split(/(?<=\.)\s/)[0];
          lines.push(`- ${c.name}: ${summary}\n  ${c.import}`);
        }
        lines.push("", "Call get_component for props and examples before using one.");
      }
      if (!lines.length) {
        lines.push(`Nothing in @dsw/ui matches "${need}". Call list_components to browse, and if it's truly missing, say so rather than building a one-off.`);
      }
      return text(lines.join("\n"));
    },
  );

  /* ---------------- Tokens ---------------- */

  server.registerTool(
    "search_tokens",
    {
      title: "Search tokens",
      description:
        "Find design tokens by words in their name, description or component (e.g. \"muted text\", \"danger\", \"radius\"), optionally filtered by group, tier or component. Returns the JS reference to use in stylex.create(), its import and its value in the chosen theme.",
      inputSchema: {
        query: z.string().optional().describe("Words that must all appear"),
        group: z.string().optional().describe('Token group, e.g. "color", "space", "buttonTokens"'),
        tier: z.enum(["semantic", "component"]).optional(),
        component: z.string().optional().describe('e.g. "Button", "Switch"'),
        theme: themeArg,
        limit: z.number().int().min(1).max(200).optional().describe("Default 40"),
      },
      annotations: readOnly,
    },
    async ({ query, group, tier, component, theme, limit }) => {
      const th = assertTheme(theme ?? DEFAULT_THEME);
      const found = searchTokens({ query, group, tier, component });
      if (found.length === 0) return text(`No tokens match. Groups: ${tokens.groups.map((g) => g.name).join(", ")}`);
      const shown = found.slice(0, limit ?? 40);
      const byImport = new Map<string, string[]>();
      for (const t of shown) byImport.set(t.import, [...(byImport.get(t.import) ?? []), tokenLine(t, th)]);
      return text(
        [
          `${found.length} token(s), values in ${th}${found.length > shown.length ? ` (showing ${shown.length})` : ""}:`,
          ...[...byImport].map(([imp, lines]) => `\nfrom "${imp}":\n${lines.map((l) => `- ${l}`).join("\n")}`),
        ].join("\n"),
      );
    },
  );

  server.registerTool(
    "get_token",
    {
      title: "Get token",
      description:
        "One token in full: value in every brand × mode, what it aliases, media-query variants (such as reduced motion), and the audited contrast pairs it's part of.",
      inputSchema: { ref: z.string().describe('e.g. "color.fgMuted" or "buttonTokens.primaryBg"') },
      annotations: readOnly,
    },
    async ({ ref }) => {
      const t = tokenByRef.get(ref.trim());
      if (!t) {
        const close = searchTokens({ query: ref.split(".").pop() }).slice(0, 8).map((x) => x.ref);
        return { ...text(`No token "${ref}". Did you mean: ${close.join(", ") || "(none)"}`), isError: true };
      }
      const pairs = tokens.contrast.filter((p) => p.fg === t.ref || p.bg === t.ref);
      return text(
        [
          `# ${t.ref}`,
          `import { ${t.group} } from "${t.import}";  // use as ${t.ref}`,
          t.description ?? "",
          `## Values\n${tokens.themes.map((th) => `- ${th}: ${t.values[th]}${t.alias?.[th] ? `  (→ ${t.alias[th]})` : ""}`).join("\n")}`,
          t.conditions &&
            `## Variants\n${Object.entries(t.conditions)
              .map(([cond, v]) => `- ${cond}: ${[...new Set(Object.values(v))].join(" / ")}`)
              .join("\n")}`,
          pairs.length > 0 &&
            `## Audited contrast pairs\n${pairs.map((p) => `- ${p.component} / ${p.usage}: ${p.fg} on ${p.bg}, min ${Math.min(...Object.values(p.ratios))}:1 (needs ${p.min}:1)`).join("\n")}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
    },
  );

  server.registerTool(
    "find_token_for_value",
    {
      title: "Find token for a hardcoded value",
      description:
        'Map a hardcoded CSS value (from a design, a screenshot or legacy code) to the token to use: "#6a58ee", "12px", "150ms", "600". Exact matches first, then nearest. Pass the CSS property to narrow it (e.g. padding → space, borderRadius → radius).',
      inputSchema: {
        value: z.string(),
        property: z.string().optional().describe('CSS property in camelCase, e.g. "paddingInline"'),
        theme: themeArg,
      },
      annotations: readOnly,
    },
    async ({ value, property, theme }) => {
      const th = assertTheme(theme ?? DEFAULT_THEME);
      const found = findTokens(value, { theme: th, property, limit: 5 });
      if (found.length === 0) return text(`No token is close to "${value}". Check the value, or this may need a new token.`);
      return text(
        [
          `Tokens for ${value}${property ? ` (${property})` : ""} in ${th}:`,
          ...found.map(
            (s) =>
              `- ${s.exact ? "EXACT " : ""}${s.token.ref} = ${s.value}  ← import { ${s.token.group} } from "${s.token.import}"${s.note ? ` — ${s.note}` : ""}`,
          ),
        ].join("\n"),
      );
    },
  );

  server.registerTool(
    "check_contrast",
    {
      title: "Check contrast",
      description:
        "WCAG contrast for a foreground/background pair. Each side can be a token ref (resolved per theme) or a colour (#hex, rgb()). With token refs, checks every theme unless one is given. Reports 4.5:1 (text) and 3:1 (boundaries, indicators, focus) and whether the pair is already in the audited list.",
      inputSchema: {
        foreground: z.string(),
        background: z.string(),
        theme: themeArg,
      },
      annotations: readOnly,
    },
    async ({ foreground, background, theme }) => {
      const usesTokens = tokenByRef.has(foreground.trim()) || tokenByRef.has(background.trim());
      const themes = theme ? [assertTheme(theme)] : usesTokens ? tokens.themes : [DEFAULT_THEME];
      const { rows, audited } = contrastReport(foreground, background, themes);
      const worst = Math.min(...rows.map((r) => r.ratio));
      return text(
        [
          ...rows.map(
            (r) =>
              `- ${r.theme}: ${r.ratio}:1 — text ${r.text ? "PASS" : "FAIL"} (4.5), UI ${r.ui ? "PASS" : "FAIL"} (3)  [${r.fg} on ${r.bg}]`,
          ),
          "",
          `Worst case ${worst}:1 → ${worst >= 4.5 ? "OK for text and UI" : worst >= 3 ? "OK for boundaries/indicators only, NOT for text" : "FAILS AA: don't ship this pairing"}.`,
          audited.length > 0
            ? `Audited as: ${audited.map((a) => `${a.component} / ${a.usage}`).join("; ")}.`
            : usesTokens
              ? "Not in the audited list: if this pairing ships, add it to packages/tokens/src/contrast.ts."
              : "",
        ]
          .filter((l) => l !== undefined)
          .join("\n"),
      );
    },
  );

  /* ---------------- Rules ---------------- */

  server.registerTool(
    "lint_styles",
    {
      title: "Lint styles",
      description:
        "Run the design system's ESLint rules (@dsw/eslint-plugin, the same ones CI runs) on code: no hardcoded colours/lengths/durations/weights in stylex.create(); no primitive-token or barrel imports; and in app code, @dsw/ui components instead of native <button>/<a>/<h1>/<input>…, no direct React Aria imports, Stack/Inline/Grid instead of hand-written layout styles, no inline style objects. Each hardcoded value comes with suggested tokens. Run before finishing any UI change.",
      inputSchema: {
        code: z.string().describe("Source of a .ts/.tsx file or snippet"),
        scope: z
          .enum(["app", "library"])
          .optional()
          .describe('"app" (default): code built with @dsw/ui. "library": code inside @dsw/ui itself, where only token rules apply.'),
        theme: themeArg,
      },
      annotations: readOnly,
    },
    async ({ code, scope, theme }) => {
      const findings = lintStyles(code, theme ? assertTheme(theme) : undefined, scope ?? "app");
      if (findings.length === 0) return text("✓ No findings: tokens and design-system components throughout.");
      return text(
        [
          `${findings.length} finding(s):`,
          ...findings.map((f) => {
            const sugg = f.suggestions?.length
              ? `\n    try: ${f.suggestions.map((s) => `${s.token.ref}${s.exact ? " (exact)" : ""} = ${s.value}`).join(" | ")}`
              : "";
            return `- L${f.line}:${f.column} [${f.rule}] ${f.property ? `${f.property}: ` : ""}${f.message}${sugg}`;
          }),
          "",
          'A deliberate one-off may stay with a "// token-exempt: <reason>" comment on the same or previous line.',
        ].join("\n"),
      );
    },
  );

  server.registerTool(
    "list_brands",
    {
      title: "List brands and themes",
      description: "The brands, their fonts and character, the theme ids, and how to apply a brand × mode.",
      annotations: readOnly,
    },
    async () =>
      text(
        [
          ...tokens.brands.map(
            (b) =>
              `- ${b.label} (\`${b.id}\`): ${b.tagline}. Fonts: ${b.fonts.display} / ${b.fonts.sans} / ${b.fonts.mono}.`,
          ),
          "",
          `Themes: ${tokens.themes.join(", ")}.`,
          "Apply exactly one theme list to <html> (overlays are portaled to <body>, and component-token aliases resolve at :root):",
          '  import { themes } from "@dsw/tokens/themes";',
          "  document.documentElement.className = stylex.props(themes[brand][mode]).className;",
          'In React, <ThemeProvider> from @dsw/ui does this (useTheme() reads or changes the brand and mode). Load fonts once with import "@dsw/tokens/fonts".',
          `Breakpoints (@dsw/tokens/breakpoints.stylex): ${Object.entries(tokens.breakpoints)
            .map(([k, v]) => `${k} = ${v}`)
            .join("; ")}.`,
        ].join("\n"),
      ),
  );

  server.registerTool(
    "get_guidelines",
    {
      title: "Get guidelines",
      description: `Design-system guidance from ARCHITECTURE.md and ACCESSIBILITY.md, by topic (e.g. "tokens", "brands", "contrast", "forced colours", "fieldset", "controlled", "loading", "accessibility"). Sections: ${sections.map((s) => s.heading).join("; ")}.`,
      inputSchema: { topic: z.string() },
      annotations: readOnly,
    },
    async ({ topic }) => {
      const found = findGuidelines(topic);
      if (found.length === 0) return text(`Nothing on "${topic}". Sections: ${sections.map((s) => s.path).join("; ")}`);
      return text(found.map((s) => `## ${s.path}  _(${s.source})_\n\n${s.body}`).join("\n\n---\n\n"));
    },
  );

  /* ---------------- Resources ---------------- */

  server.registerResource(
    "components",
    "dsw://components",
    { title: "Component manifest", description: "@dsw/ui components, props and stories (JSON)", mimeType: "application/json" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(components, null, 2) }] }),
  );
  server.registerResource(
    "tokens",
    "dsw://tokens",
    { title: "Token manifest", description: "Every token with values per theme, and the contrast audit (JSON)", mimeType: "application/json" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(tokens, null, 2) }] }),
  );
  server.registerResource(
    "dtcg",
    new ResourceTemplate("dsw://tokens/{brand}/{mode}", {
      list: async () => ({
        resources: tokens.themes.map((t) => ({
          uri: `dsw://tokens/${t}`,
          name: `DTCG tokens — ${t}`,
          mimeType: "application/json",
        })),
      }),
    }),
    { title: "DTCG tokens per theme", description: "W3C Design Tokens (DTCG) file for one brand × mode", mimeType: "application/json" },
    async (uri, { brand, mode }) => {
      assertTheme(`${String(brand)}/${String(mode)}`);
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: dtcgFor(String(brand), String(mode)) }] };
    },
  );
  for (const [name, body] of Object.entries(docs)) {
    server.registerResource(
      `docs-${name}`,
      `dsw://docs/${name}`,
      { title: `${name[0]!.toUpperCase()}${name.slice(1)} guide`, mimeType: "text/markdown" },
      async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: body }] }),
    );
  }

  return server;
}
