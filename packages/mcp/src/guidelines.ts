import { docs } from "./data.ts";

export interface Section {
  source: "ARCHITECTURE.md" | "ACCESSIBILITY.md";
  heading: string;
  path: string;
  body: string;
}

/** Splits the repo's docs into ##/### sections, keeping their heading path. */
function sectionsOf(source: Section["source"], markdown: string): Section[] {
  const out: Section[] = [];
  let h2 = "";
  let current: Section | undefined;
  for (const line of markdown.split("\n")) {
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (m?.[1] && m[2]) {
      if (current) out.push(current);
      if (m[1] === "##") h2 = m[2];
      const heading = m[2];
      current = { source, heading, path: m[1] === "##" ? heading : `${h2} › ${heading}`, body: "" };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) out.push(current);
  return out.map((s) => ({ ...s, body: s.body.trim() }));
}

export const sections: Section[] = [
  ...sectionsOf("ARCHITECTURE.md", docs.architecture),
  ...sectionsOf("ACCESSIBILITY.md", docs.accessibility),
];

/** Sections ranked by how many query words appear (headings count triple). */
export function findGuidelines(topic: string, limit = 3): Section[] {
  const words = topic.toLowerCase().split(/[\s,/-]+/).filter((w) => w.length > 2);
  return sections
    .map((s) => {
      const head = s.path.toLowerCase();
      const body = s.body.toLowerCase();
      const score = words.reduce(
        (n, w) => n + (head.includes(w) ? 3 : 0) + (body.split(w).length - 1 > 0 ? 1 : 0),
        0,
      );
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}
