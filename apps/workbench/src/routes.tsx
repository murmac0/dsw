import { useSyncExternalStore, type ReactNode } from "react";
import { OverviewPage } from "./pages/OverviewPage";
import { GetStartedPage } from "./pages/GetStartedPage";
import { FoundationsPage } from "./pages/FoundationsPage";
import { AccessibilityPage } from "./pages/AccessibilityPage";
import { ComponentsIndexPage } from "./pages/ComponentsIndexPage";
import {
  ButtonPage,
  ControlledPatternPage,
  DialogPage,
  FieldsetPage,
  FormPatternPage,
  SelectionControlsPage,
  SelectPage,
  TextFieldPage,
} from "./pages/ComponentsPage";
import { SettingsExamplePage } from "./pages/SettingsExamplePage";
import { AiReadyPage } from "./pages/AiReadyPage";
import { LintPage } from "./pages/LintPage";

/**
 * The site map. One list drives the sidebar, the page titles and routing,
 * so a page can't be reachable without being in the navigation.
 *
 * Grouped by what a reader is trying to do, in the order they'd do it:
 * understand the system, start using it, learn its foundations, find a
 * component, see it composed, then the tooling that keeps code on-system.
 */
export interface Route {
  path: string;
  /** Sidebar label: short, a noun. */
  label: string;
  /** The page's h1 and document title, when it differs from the label. */
  title?: string;
  /** One or two sentences under the h1: what the page is for. */
  lede?: string;
  render: () => ReactNode;
}

export interface RouteGroup {
  /** Sidebar group label; the first group has none. */
  label?: string;
  routes: Route[];
}

export const siteMap: RouteGroup[] = [
  {
    routes: [
      { path: "/", label: "Overview", render: () => <OverviewPage /> },
      {
        path: "/get-started",
        label: "Get started",
        lede: "Start an app on the design system, or bring it into one you already have.",
        render: () => <GetStartedPage />,
      },
    ],
  },
  {
    label: "Foundations",
    routes: [
      {
        path: "/foundations",
        label: "Tokens and themes",
        lede: "Three tiers of tokens, three brands, light and dark. Switch brand or mode at the top and every value below re-resolves.",
        render: () => <FoundationsPage />,
      },
      {
        path: "/accessibility",
        label: "Accessibility",
        lede: "WCAG 2.2 AA, built into the components and checked on every push in all six themes.",
        render: () => <AccessibilityPage />,
      },
    ],
  },
  {
    label: "Components",
    routes: [
      {
        path: "/components",
        label: "All components",
        title: "Components",
        lede: "React 19 components built on React Aria. Every stateful one works controlled and uncontrolled.",
        render: () => <ComponentsIndexPage />,
      },
      {
        path: "/components/button",
        label: "Button",
        lede: "Triggers an action. One primary per view; the rest secondary or ghost.",
        render: () => <ButtonPage />,
      },
      {
        path: "/components/text-field",
        label: "Text field",
        lede: "A labelled single-line input with a description and an error slot.",
        render: () => <TextFieldPage />,
      },
      {
        path: "/components/select",
        label: "Select",
        lede: "Choose one option from a list, with full keyboard support.",
        render: () => <SelectPage />,
      },
      {
        path: "/components/selection-controls",
        label: "Checkbox, switch, radio",
        title: "Checkbox, switch and radio",
        lede: "Checkboxes for choices applied on submit, switches for settings that apply at once, radios for one of a few.",
        render: () => <SelectionControlsPage />,
      },
      {
        path: "/components/fieldset",
        label: "Fieldset",
        lede: "Groups related fields under one announced legend, and disables them all with one prop.",
        render: () => <FieldsetPage />,
      },
      {
        path: "/components/dialog",
        label: "Dialog",
        lede: "A modal that traps focus, closes on Escape and returns focus to its trigger.",
        render: () => <DialogPage />,
      },
    ],
  },
  {
    label: "Patterns",
    routes: [
      {
        path: "/patterns/form",
        label: "Form",
        lede: "Every control in one realistic form: shared label, description and error anatomy, one focus ring, one set of tokens.",
        render: () => <FormPatternPage />,
      },
      {
        path: "/patterns/controlled-state",
        label: "Controlled state",
        lede: "The same components driven by parent state. The readout is the single source of truth.",
        render: () => <ControlledPatternPage />,
      },
      {
        path: "/patterns/settings-page",
        label: "Settings page",
        title: "Example: a settings page",
        lede: "A complete product page built only from @dsw/ui: no CSS, no StyleX, no hardcoded values.",
        render: () => <SettingsExamplePage />,
      },
    ],
  },
  {
    label: "Tooling",
    routes: [
      {
        path: "/ai",
        label: "AI agents",
        title: "Built for AI coding agents",
        lede: "What coding agents read, what they can ask, and the checks their code has to pass. Every number and answer here comes from the real agent files and the real MCP server.",
        render: () => <AiReadyPage />,
      },
      {
        path: "/lint",
        label: "Lint rules and codemod",
        lede: "One set of rules for CI, editors, the MCP server and the migration codemod.",
        render: () => <LintPage />,
      },
    ],
  },
];

export const routes = siteMap.flatMap((g) =>
  g.routes.map((r) => ({ ...r, group: g.label })),
);

export const href = (path: string) => `#${path}`;

/* Hash routing: GitHub Pages serves one static file, and a hash URL
   deep-links to any page without server rewrites. */

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const currentPath = () => {
  const path = window.location.hash.replace(/^#/, "");
  return path.startsWith("/") ? path.replace(/(.)\/$/, "$1") : "/";
};

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => "/");
}
