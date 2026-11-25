/**
 * Every page in the site map, as hash URLs. navigation.spec.ts checks this
 * list against the sidebar, so a new page can't skip the page-wide checks
 * (axe, reflow) by being left out of it.
 */
export const PAGES = {
  overview: "/#/",
  getStarted: "/#/get-started",
  foundations: "/#/foundations",
  accessibility: "/#/accessibility",
  components: "/#/components",
  button: "/#/components/button",
  textField: "/#/components/text-field",
  select: "/#/components/select",
  selectionControls: "/#/components/selection-controls",
  fieldset: "/#/components/fieldset",
  dialog: "/#/components/dialog",
  form: "/#/patterns/form",
  controlled: "/#/patterns/controlled-state",
  settings: "/#/patterns/settings-page",
  ai: "/#/ai",
  lint: "/#/lint",
} as const;

export const ALL_PAGES = Object.values(PAGES);
