import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { createHighlighter, type BundledLanguage, type ThemeRegistration } from "shiki";
import type { Plugin } from "vite";

/**
 * `import source from "./Variants.tsx?example"` gives the file's source and
 * its syntax tokens, worked out at build time, so the page ships no
 * highlighter. The same file is imported normally to render the demo: the
 * code shown is the code that runs.
 *
 * Shiki colours tokens from a theme. This theme gives each syntax role a
 * placeholder colour, which is read back as a role name; @dsw/ui's
 * CodeBlock then paints each role with a contrast-checked token.
 */

const ROLE_BY_COLOR = {
  "#000001": "comment",
  "#000002": "keyword",
  "#000003": "string",
  "#000004": "name",
  "#000005": "attribute",
} as const;

const roleTheme: ThemeRegistration = {
  name: "dsw-roles",
  type: "light",
  fg: "#000000",
  bg: "#ffffff",
  settings: [
    { settings: { foreground: "#000000" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#000001" } },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "constant.language",
        "variable.language",
      ],
      settings: { foreground: "#000002" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "constant.numeric"],
      settings: { foreground: "#000003" },
    },
    {
      scope: [
        "entity.name.function",
        "entity.name.type",
        "entity.name.tag",
        "entity.name.class",
        "support.class.component",
        "support.function",
      ],
      settings: { foreground: "#000004" },
    },
    {
      scope: ["entity.other.attribute-name", "meta.object-literal.key", "support.type.property-name"],
      settings: { foreground: "#000005" },
    },
  ],
};

const LANG_BY_EXT: Record<string, BundledLanguage> = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".js": "js",
  ".sh": "bash",
  ".json": "json",
};

const QUERY = "?example";

export function examples(): Plugin {
  const highlighter = createHighlighter({
    themes: [roleTheme],
    langs: [...new Set(Object.values(LANG_BY_EXT))],
  });

  return {
    name: "dsw-examples",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(QUERY)) return null;
      const resolved = await this.resolve(source.slice(0, -QUERY.length), importer, {
        skipSelf: true,
      });
      return resolved && `${resolved.id}${QUERY}`;
    },
    async load(id) {
      if (!id.endsWith(QUERY)) return null;
      const file = id.slice(0, -QUERY.length);
      this.addWatchFile(file);
      const code = (await readFile(file, "utf8")).trimEnd();
      const lines = (await highlighter).codeToTokensBase(code, {
        lang: LANG_BY_EXT[extname(file)] ?? "text",
        theme: roleTheme,
      });
      const tokens = lines.map((line) =>
        line.map(({ content, color }) => {
          const kind = ROLE_BY_COLOR[color?.toLowerCase() as keyof typeof ROLE_BY_COLOR];
          return kind ? { text: content, kind } : { text: content };
        }),
      );
      return `export default ${JSON.stringify({ title: basename(file), code, tokens })};`;
    },
  };
}
