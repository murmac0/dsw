import { components, type ComponentEntry } from "./data.ts";

/**
 * What people call things → what @dsw/ui calls them. Agents describe UI
 * in product language ("a modal", "a pill", "a banner"), and the
 * component names alone don't match those words.
 */
const SYNONYMS: Array<[RegExp, string[]]> = [
  [/\b(modal|popup|pop-up|overlay|lightbox|confirm(ation)?|are you sure)\b/, ["Dialog"]],
  [/\b(dropdown|drop-down|picker|combo ?box|choose one from|select)\b/, ["Select"]],
  [/\b(toggle|on\/off|switch)\b/, ["Switch"]],
  [/\b(tags?|pills?|chips?|status|badges?|lozenge|count)\b/, ["Badge"]],
  [/\b(banner|callout|notice|alert|warning|error message|success message|info box)\b/, ["Alert"]],
  [/\b(panel|tile|box|card|surface|settings section)\b/, ["Card"]],
  [/\b(title|heading|headline|h[1-6])\b/, ["Heading"]],
  [/\b(paragraph|copy|caption|body text|helper text|text|label)\b/, ["Text"]],
  [/\b(vertical|stack|column of|one above)\b/, ["Stack"]],
  [/\b(row|horizontal|toolbar|button group|side by side|inline|next to)\b/, ["Inline"]],
  [/\b(grid|tiles|gallery|columns|cards? layout)\b/, ["Grid"]],
  [/\b(page width|max(imum)? width|wrapper|centred|centered|page container|layout container)\b/, ["Container"]],
  [/\b(link|anchor|href|navigate|go to)\b/, ["Link"]],
  [/\b(button|cta|call to action|submit|action)\b/, ["Button"]],
  [/\b(input|text ?field|text ?box|email|password|search box|form field)\b/, ["TextField"]],
  [/\b(checkbox(es)?|tick ?box|multi-?select|agree to)\b/, ["Checkbox", "CheckboxGroup"]],
  [/\b(radio|single choice|pick one)\b/, ["RadioGroup"]],
  [/\b(tabs?|segmented|sub-?sections?)\b/, ["Tabs"]],
  [/\b(fieldset|group of fields|form section|address block)\b/, ["Fieldset"]],
];

/** Common needs @dsw/ui doesn't cover yet, with the nearest stand-in. */
const NOT_YET: Array<[RegExp, string, string]> = [
  [/\b(toast|snackbar)\b/, "Toast", "an Alert with `announce`, shown inline where the action happened"],
  [/\btooltip\b/, "Tooltip", "visible helper text (Text or a field's `description`), which also works on touch"],
  [/\b(table|data ?grid|spreadsheet)\b/, "Table", "a Stack of rows (as=\"ul\") for short lists; a real table needs a component"],
  [/\b(avatar|profile (photo|picture))\b/, "Avatar", "nothing yet: show the name as Text"],
  [/\b(textarea|multi-?line)\b/, "multi-line text field", "nothing yet: TextField is single-line"],
  [/\b(date ?picker|calendar)\b/, "Date picker", "a TextField with type=\"date\" until one exists"],
  [/\b(slider|range input)\b/, "Slider", "nothing yet"],
  [/\b(context menu|dropdown menu|kebab|overflow menu|action menu)\b/, "Menu", "a Select only if it picks a value; actions need a Menu component"],
  [/\b(progress bar|stepper|wizard)\b/, "Progress / Stepper", "nothing yet; Button's `isLoading` covers in-flight actions"],
  [/\b(breadcrumbs?)\b/, "Breadcrumbs", "an Inline of Links inside a <nav>"],
  [/\b(pagination|pager)\b/, "Pagination", "an Inline of Buttons inside a <nav>"],
];

export interface ComponentSuggestion {
  component: ComponentEntry;
  why: "synonym" | "match";
}

export interface SuggestResult {
  suggestions: ComponentSuggestion[];
  missing: Array<{ name: string; meanwhile: string }>;
}

const byName = new Map(components.components.map((c) => [c.name, c]));

/** Components for a need described in words, a native tag, or a snippet. */
export function suggestComponents(need: string, limit = 4): SuggestResult {
  const q = need.toLowerCase();
  const scores = new Map<string, { score: number; why: ComponentSuggestion["why"] }>();
  const add = (name: string, score: number, why: ComponentSuggestion["why"]) => {
    if (!byName.has(name)) return;
    const prev = scores.get(name);
    if (!prev || prev.score < score) scores.set(name, { score, why });
  };

  SYNONYMS.forEach(([re, names], i) => {
    // Earlier, more specific synonyms win ties ("confirmation" → Dialog
    // before "action" → Button).
    if (re.test(q)) names.forEach((n) => add(n, 100 - i, "synonym"));
  });

  const missing = NOT_YET.filter(([re]) => re.test(q)).map(([, name, meanwhile]) => ({ name, meanwhile }));

  // Fall back to the manifest (component names and doc words) only when
  // nothing else matched: incidental words make poor suggestions.
  const words = scores.size || missing.length ? [] : q.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  for (const c of words.length ? components.components : []) {
    if (c.kind !== "component") continue;
    const hay = `${c.name} ${c.description ?? ""}`.toLowerCase();
    const hits = words.filter((w) => hay.includes(w)).length;
    if (q.includes(c.name.toLowerCase())) add(c.name, 90, "match");
    else if (hits) add(c.name, hits, "match");
  }

  const suggestions = [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([name, { why }]) => ({ component: byName.get(name)!, why }));

  return { suggestions, missing };
}
