import { expect, test, type Page } from "@playwright/test";

async function auditResults(page: Page) {
  await page.getByRole("tab", { name: "Foundations" }).click();
  const audit = page.getByTestId("contrast-audit");
  await expect(audit).toBeVisible();
  return page.getByTestId("contrast-row").evaluateAll((rows) =>
    rows.map((row) => ({
      usage: row.querySelector("div:nth-child(2) > div")?.textContent ?? "",
      group: row.parentElement?.querySelector("h3")?.textContent ?? "",
      ratio: Number(row.getAttribute("data-ratio")),
      pass: row.getAttribute("data-pass") === "true",
    })),
  );
}

const brands = ["Iris", "Volt", "Bloom"] as const;

for (const brand of brands) {
  for (const theme of ["light", "dark"] as const) {
    test(`every shipped colour pairing meets WCAG AA in ${brand} ${theme}`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("radio", { name: brand, exact: true }).click();
      if (theme === "dark") {
        await page.getByRole("button", { name: "Dark mode" }).click();
      }
      await expect(page.locator("html")).toHaveAttribute("data-brand", brand.toLowerCase());

      const results = await auditResults(page);
      expect(results.length).toBeGreaterThan(50);
      // A ratio of 0 means a token didn't resolve — fail loudly, don't skip.
      expect(results.filter((r) => r.ratio === 0)).toEqual([]);

      const failures = results.filter((r) => !r.pass);
      expect(
        failures,
        failures.map((f) => `${f.group} / ${f.usage}: ${f.ratio}:1`).join("\n"),
      ).toEqual([]);
    });
  }
}

test("themes actually differ (audit re-measures on switch)", async ({ page }) => {
  await page.goto("/");
  const light = await auditResults(page);
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect
    .poll(async () => (await auditResults(page))[0]?.ratio)
    .not.toBe(light[0]?.ratio);
});
