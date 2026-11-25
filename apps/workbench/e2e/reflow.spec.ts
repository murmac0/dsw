import { expect, test, type Page } from "@playwright/test";
import { ALL_PAGES, PAGES } from "./pages";

/**
 * WCAG 1.4.10 Reflow and 1.4.4 Resize text. Browser zoom on a 1280px-wide
 * window gives a 640 CSS px viewport at 200% and 320 CSS px at 400% (the
 * WCAG reflow width), so emulating those widths tests zoom behaviour.
 */
const brands = ["Iris", "Volt", "Bloom"] as const;

async function overflow(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        // Ignore 1px visually-hidden text, which is clipped by design.
        return r.width > 1 && r.right > vw + 1;
      })
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}"`);
    return { pageScroll: document.documentElement.scrollWidth - vw, offenders };
  });
}

for (const [width, zoom] of [[320, "400%"], [640, "200%"]] as const) {
  test(`reflows at ${width}px (${zoom} zoom) in every brand, no sideways scroll`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 720 });
    await page.goto(PAGES.overview);
    for (const brand of brands) {
      await page.getByRole("radio", { name: brand, exact: true }).click();
      for (const path of ALL_PAGES) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const { pageScroll, offenders } = await overflow(page);
        expect(pageScroll, `${brand} ${path}`).toBeLessThanOrEqual(0);
        expect(offenders, `${brand} ${path}`).toEqual([]);
      }
      // The settings example's other sections (members list, plan grid).
      await page.goto(PAGES.settings);
      for (const section of ["Members", "Billing"]) {
        await page.getByRole("tab", { name: section }).click();
        const { pageScroll, offenders } = await overflow(page);
        expect(pageScroll, `${brand} settings/${section}`).toBeLessThanOrEqual(0);
        expect(offenders, `${brand} settings/${section}`).toEqual([]);
      }
      // The sidebar, opened from the menu button.
      await page.getByRole("button", { name: "Menu" }).click();
      const { pageScroll, offenders } = await overflow(page);
      expect(pageScroll, `${brand} menu`).toBeLessThanOrEqual(0);
      expect(offenders, `${brand} menu`).toEqual([]);
      await page.getByRole("button", { name: "Menu" }).click();
    }
  });
}

test("text spacing overrides don't clip or spill controls (1.4.12)", async ({ page }) => {
  await page.goto(PAGES.form);
  for (const brand of brands) {
    await page.getByRole("radio", { name: brand, exact: true }).click();
    // The values WCAG 1.4.12 requires content to tolerate.
    await page.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
    });
    const problems = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("button, input, [role=tab], label, legend")]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const clipped =
            cs.overflow !== "visible" &&
            (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
          const spilled = el.tagName === "BUTTON" && el.scrollWidth > el.clientWidth + 1;
          return clipped || spilled;
        })
        .map((el) => (el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 30)),
    );
    expect(problems, brand).toEqual([]);
  }
});
