import { expect, test, type Page } from "@playwright/test";

/**
 * WCAG 1.4.10 Reflow and 1.4.4 Resize text. Browser zoom on a 1280px-wide
 * window gives a 640 CSS px viewport at 200% and 320 CSS px at 400% (the
 * WCAG reflow width), so emulating those widths tests zoom behaviour.
 */
const brands = ["Iris", "Volt", "Bloom"] as const;
const tabs = ["Components", "Foundations", "Playground", "Example page"] as const;

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
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/");
    for (const brand of brands) {
      await page.getByRole("radio", { name: brand, exact: true }).click();
      for (const tab of tabs) {
        await page.getByRole("tab", { name: tab }).click();
        const { pageScroll, offenders } = await overflow(page);
        expect(pageScroll, `${brand}/${tab}`).toBeLessThanOrEqual(0);
        expect(offenders, `${brand}/${tab}`).toEqual([]);
      }
      // The example page's other sections (members list, plan grid).
      for (const section of ["Members", "Billing"]) {
        await page.getByRole("tab", { name: section }).click();
        const { pageScroll, offenders } = await overflow(page);
        expect(pageScroll, `${brand}/Example page/${section}`).toBeLessThanOrEqual(0);
        expect(offenders, `${brand}/Example page/${section}`).toEqual([]);
      }
      await page.getByRole("tab", { name: "General" }).click();
    }
  });
}

test("text spacing overrides don't clip or spill controls (1.4.12)", async ({ page }) => {
  await page.goto("/");
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
