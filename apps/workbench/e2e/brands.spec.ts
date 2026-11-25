import { PAGES } from "./pages";
import { expect, test, type Page } from "@playwright/test";

/** Computed styles of the primary "Save changes" button. */
async function primaryButtonStyle(page: Page) {
  return page.getByRole("button", { name: "Save changes" }).evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      radius: s.borderTopLeftRadius,
      borderWidth: s.borderTopWidth,
      transform: s.textTransform,
      font: s.fontFamily,
      shadow: s.boxShadow,
      bg: s.backgroundColor,
    };
  });
}

test("each brand restyles components, not just colours", async ({ page }) => {
  // Reduced motion zeroes the colour transitions, and each read waits for
  // the brand to land on <html>, so nothing is measured mid-transition.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PAGES.form);
  const html = page.locator("html");

  await expect(html).toHaveAttribute("data-brand", "iris");
  const iris = await primaryButtonStyle(page);
  await page.getByRole("radio", { name: "Volt", exact: true }).click();
  await expect(html).toHaveAttribute("data-brand", "volt");
  const volt = await primaryButtonStyle(page);
  await page.getByRole("radio", { name: "Bloom", exact: true }).click();
  await expect(html).toHaveAttribute("data-brand", "bloom");
  const bloom = await primaryButtonStyle(page);

  // Volt: square, 2px outline, uppercase mono, hard offset shadow.
  expect(volt.radius).toBe("0px");
  expect(volt.borderWidth).toBe("2px");
  expect(volt.transform).toBe("uppercase");
  expect(volt.font).toContain("JetBrains Mono");
  expect(volt.shadow).not.toBe("none");

  // Bloom: pill buttons in Instrument Sans.
  expect(parseFloat(bloom.radius)).toBeGreaterThan(100);
  expect(bloom.font).toContain("Instrument Sans");
  expect(bloom.transform).toBe("none");

  // Iris: the default rounded rectangle in Geist.
  expect(iris.radius).toBe("10px");
  expect(iris.font).toContain("Geist");

  expect(new Set([iris.bg, volt.bg, bloom.bg]).size).toBe(3);
});

test("brand choice persists across reloads", async ({ page }) => {
  await page.goto(PAGES.overview);
  await page.getByRole("radio", { name: "Bloom", exact: true }).click();
  await page.getByRole("button", { name: "Dark mode" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-brand", "bloom");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Bloom", exact: true })).toBeChecked();
});

test("dialogs and menus pick up the brand (portaled content)", async ({ page }) => {
  await page.goto(PAGES.dialog);
  await page.getByRole("radio", { name: "Volt", exact: true }).click();
  await page.getByRole("button", { name: "Open dialog" }).click();
  const radius = await page
    .getByRole("dialog", { name: "Invite teammates" })
    .evaluate((el) => getComputedStyle(el.parentElement!).borderTopLeftRadius);
  expect(radius).toBe("0px");
});

test("checkboxes stay distinguishable from radios in every brand", async ({ page }) => {
  await page.goto(PAGES.selectionControls);
  for (const brand of ["Iris", "Volt", "Bloom"]) {
    await page.getByRole("radio", { name: brand, exact: true }).click();
    // The visible box is the label's aria-hidden indicator span.
    const box = page
      .getByRole("checkbox", { name: "Checked", exact: true })
      .locator("xpath=ancestor::label[1]/span[@aria-hidden='true'][1]");
    const radius = await box.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
    const width = await box.evaluate((el) => el.getBoundingClientRect().width);
    // Well short of a circle (radius ≥ half the width).
    expect(radius, brand).toBeLessThan(width / 3);
  }
});
