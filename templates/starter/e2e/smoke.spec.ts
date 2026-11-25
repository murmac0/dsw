import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Smoke test for an app built on @dsw: the design system's CSS reaches the
// bundle, themes apply to <html>, and the page passes WCAG 2.2 AA in every
// brand × mode. Keep it as your app grows.

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
}

async function axe(page: Page) {
  await settle(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
}

test("renders with the design system's styles", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Your workspace" }),
  ).toBeVisible();
  // If StyleX didn't compile @dsw/ui, buttons have no background colour.
  const save = page.getByRole("button", { name: "Save profile" });
  const bg = await save.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  // The theme sits on <html>, and the canvas comes from it.
  await expect(page.locator("html")).toHaveAttribute("data-brand", "iris");
  const canvas = await page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  );
  expect(canvas).not.toBe("rgba(0, 0, 0, 0)");
});

for (const brand of ["Iris", "Volt", "Bloom"]) {
  for (const mode of ["light", "dark"] as const) {
    test(`axe: no WCAG 2.2 AA violations, ${brand} ${mode}`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /Brand/ }).click();
      await page.getByRole("option", { name: brand }).click();
      if (mode === "dark") {
        // React Aria's <input> is visually hidden under the track; click
        // the visible label, as a person would.
        await page.getByText("Dark mode", { exact: true }).click();
      }
      await expect(page.locator("html")).toHaveAttribute(
        "data-brand",
        brand.toLowerCase(),
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", mode);

      const problems = await axe(page);
      await page.getByRole("button", { name: "Delete workspace" }).click();
      await expect(page.getByRole("alertdialog")).toBeVisible();
      problems.push(...(await axe(page)).map((p) => `dialog: ${p}`));
      expect(problems).toEqual([]);
    });
  }
}

test("saving announces the result", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(
    page.getByRole("status").or(page.getByRole("alert")),
  ).toContainText("Profile saved");
});
