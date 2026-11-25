import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ALL_PAGES, PAGES } from "./pages";

// WCAG 2.0, 2.1 and 2.2, levels A and AA.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function scan(page: Page, label: string) {
  // Let entrance animations finish: mid-fade text is semi-transparent,
  // and axe would measure a colour the user never settles on.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
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
      test.setTimeout(120_000);
      await page.goto(PAGES.overview);
      await page.getByRole("radio", { name: brand, exact: true }).click();
      if (mode === "dark") await page.getByRole("button", { name: "Dark mode" }).click();

      // Every page in the site map.
      const problems: string[] = [];
      for (const path of ALL_PAGES) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        problems.push(...(await scan(page, path)));
      }

      // Open overlays are scanned separately: they're portaled to <body>.
      await page.goto(PAGES.select);
      await page.getByRole("button", { name: /Country/ }).first().click();
      await expect(page.getByRole("listbox")).toBeVisible();
      problems.push(...(await scan(page, "Select open")));
      await page.keyboard.press("Escape");

      await page.goto(PAGES.dialog);
      await page.getByRole("button", { name: "Open dialog" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      problems.push(...(await scan(page, "Dialog open")));
      await page.keyboard.press("Escape");

      // Highlighted code, and the phone-width frame (axe scans inside it).
      await page.goto(PAGES.button);
      await page.getByRole("button", { name: "Show code: Variants.tsx" }).click();
      problems.push(...(await scan(page, "Code shown")));
      await page.goto(PAGES.settings);
      await page.getByText("Phone (375px)").click();
      await expect(
        page.frameLocator("iframe").getByRole("heading", { name: "Settings", level: 2 }),
      ).toBeVisible();
      problems.push(...(await scan(page, "Settings page in a phone frame")));
      await page.getByText("Full width").click();

      // The settings example's other sections, plus its invite dialog.
      await page.goto(PAGES.settings);
      for (const section of ["Members", "Billing"]) {
        await page.getByRole("tab", { name: section }).click();
        problems.push(...(await scan(page, `Settings page / ${section}`)));
      }
      await page.getByRole("tab", { name: "Members" }).click();
      await page.getByRole("button", { name: "Invite member" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      problems.push(...(await scan(page, "Invite dialog open")));
      await page.keyboard.press("Escape");

      // The phone menu, open.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("button", { name: "Menu" }).click();
      problems.push(...(await scan(page, "Menu open")));

      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
}
