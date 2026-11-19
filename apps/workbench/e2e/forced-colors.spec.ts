import { expect, test, type Locator } from "@playwright/test";

/**
 * Windows High Contrast / forced-colours mode strips background colours at
 * paint time. getComputedStyle still reports the author's colours there,
 * so these tests compare *pixels*: the same element is screenshotted in
 * two states, and if the state isn't painted the two images are identical.
 */
test.use({ colorScheme: "dark" });
test.beforeEach(async ({ page }) => {
  // reducedMotion makes transitions instant, so screenshots are stable.
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/");
});

const shot = (l: Locator) => l.screenshot({ animations: "disabled" });

test("a radio's selected state is painted", async ({ page }) => {
  const radio = page.getByRole("radio", { name: "Compact", exact: true });
  const indicator = radio.locator("xpath=ancestor::label[1]/span[@aria-hidden='true']");
  const before = await shot(indicator);
  await indicator.click();
  await expect(radio).toBeChecked();
  expect((await shot(indicator)).equals(before)).toBe(false);
});

test("a switch's on/off state is painted", async ({ page }) => {
  const sw = page.getByRole("switch", { name: "Dark mode sync", exact: true });
  // The visible track is the label's aria-hidden span (React Aria wraps the
  // real input in its own visually-hidden span).
  const track = sw.locator("xpath=ancestor::label[1]/span[@aria-hidden='true']");
  const off = await shot(track);
  await track.click();
  await expect(sw).toBeChecked();
  expect((await shot(track)).equals(off)).toBe(false);
});

test("the selected tab is painted differently from an unselected one", async ({
  page,
}) => {
  const tab = page.getByRole("tab", { name: "Components" });
  const selected = await shot(tab);
  await page.getByRole("tab", { name: "Foundations" }).click();
  await expect(tab).toHaveAttribute("aria-selected", "false");
  expect((await shot(tab)).equals(selected)).toBe(false);
});

test("a @dsw/ui Tab's selected state is painted", async ({ page }) => {
  await page.getByRole("tab", { name: "Example page" }).click();
  const tab = page.getByRole("tab", { name: "General" });
  const selected = await shot(tab);
  await page.getByRole("tab", { name: "Members" }).click();
  await expect(tab).toHaveAttribute("aria-selected", "false");
  expect((await shot(tab)).equals(selected)).toBe(false);
});

test("a Badge keeps a visible outline", async ({ page }) => {
  await page.getByRole("tab", { name: "Example page" }).click();
  const badge = page.getByText("Pro plan", { exact: true });
  const width = await badge.evaluate((el) => getComputedStyle(el).borderTopWidth);
  expect(parseFloat(width)).toBeGreaterThan(0);
});

test("the selected brand is painted differently", async ({ page }) => {
  const iris = page.getByRole("radio", { name: "Iris", exact: true });
  const selected = await shot(iris);
  await page.getByRole("radio", { name: "Volt", exact: true }).click();
  await expect(iris).not.toBeChecked();
  expect((await shot(iris)).equals(selected)).toBe(false);
});

test("keyboard focus in a Select menu is painted", async ({ page }) => {
  await page.getByRole("button", { name: /Country/ }).first().focus();
  await page.keyboard.press("Enter");
  const first = page.getByRole("option", { name: "Ireland" });
  await expect(first).toBeFocused();
  const focused = await shot(first);
  await page.keyboard.press("ArrowDown");
  await expect(first).not.toBeFocused();
  expect((await shot(first)).equals(focused)).toBe(false);
});
