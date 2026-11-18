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
  await page.goto("/");

  const iris = await primaryButtonStyle(page);
  await page.getByRole("radio", { name: "Volt", exact: true }).click();
  const volt = await primaryButtonStyle(page);
  await page.getByRole("radio", { name: "Bloom", exact: true }).click();
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
  await page.goto("/");
  await page.getByRole("radio", { name: "Bloom", exact: true }).click();
  await page.getByRole("button", { name: "Dark mode" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-brand", "bloom");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Bloom", exact: true })).toBeChecked();
});

test("dialogs and menus pick up the brand (portaled content)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Volt", exact: true }).click();
  await page.getByRole("button", { name: "Open dialog" }).click();
  const radius = await page
    .getByRole("dialog", { name: "Invite teammates" })
    .evaluate((el) => getComputedStyle(el.parentElement!).borderTopLeftRadius);
  expect(radius).toBe("0px");
});
