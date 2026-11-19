import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// WCAG 2.0, 2.1 and 2.2, levels A and AA.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function scan(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = violations.map(
    (v) =>
      `[${label}] ${v.id} (${v.impact}): ${v.help}\n` +
      v.nodes
        .slice(0, 4)
        .map((n) => `    ${n.target.join(" ")} — ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`)
        .join("\n"),
  );
  return summary;
}

const brands = ["Iris", "Volt", "Bloom"] as const;

for (const brand of brands) {
  for (const mode of ["light", "dark"] as const) {
    test(`axe: no WCAG 2.2 AA violations — ${brand} ${mode}`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("radio", { name: brand, exact: true }).click();
      if (mode === "dark") await page.getByRole("button", { name: "Dark mode" }).click();

      const problems: string[] = [];
      problems.push(...(await scan(page, "Components")));

      // Open overlays are scanned separately: they're portaled to <body>.
      await page.getByRole("button", { name: /Country/ }).first().click();
      await expect(page.getByRole("listbox")).toBeVisible();
      problems.push(...(await scan(page, "Select open")));
      await page.keyboard.press("Escape");

      await page.getByRole("button", { name: "Open dialog" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      problems.push(...(await scan(page, "Dialog open")));
      await page.keyboard.press("Escape");

      for (const tab of ["Foundations", "Playground"]) {
        await page.getByRole("tab", { name: tab }).click();
        problems.push(...(await scan(page, tab)));
      }

      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
}
