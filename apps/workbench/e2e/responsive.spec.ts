import { expect, test } from "@playwright/test";

const sections = ["Components", "Foundations", "Playground"] as const;

test.describe("phone viewport", () => {
  // iPhone-sized touch device; hasTouch makes Chromium report
  // `pointer: coarse`, which the size tokens respond to.
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });

  for (const section of sections) {
    test(`${section} has no horizontal overflow`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("tab", { name: section }).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("controls grow to 44px touch targets", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("textbox", { name: "Billing email" });
    const box = await input.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test("dialog docks to the bottom and stacks its actions", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Invite teammates" });
    await expect(dialog).toBeVisible();

    const dialogBox = await dialog.boundingBox();
    const viewport = page.viewportSize();
    expect(dialogBox && viewport).toBeTruthy();
    // Bottom edge sits near the bottom of the screen (sheet-style).
    expect(viewport!.height - (dialogBox!.y + dialogBox!.height)).toBeLessThan(40);

    const cancel = await dialog.getByRole("button", { name: "Cancel" }).boundingBox();
    const send = await dialog.getByRole("button", { name: "Send invites" }).boundingBox();
    // Stacked, primary on top, both full width.
    expect(send!.y).toBeLessThan(cancel!.y);
    expect(Math.round(send!.width)).toBe(Math.round(cancel!.width));
  });
});

test("desktop keeps mouse-sized controls", async ({ page }) => {
  await page.goto("/");
  const box = await page
    .getByRole("textbox", { name: "Billing email" })
    .boundingBox();
  expect(box?.height).toBe(40);
});
