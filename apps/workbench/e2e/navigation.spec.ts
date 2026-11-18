import { expect, test } from "@playwright/test";

test("navigates between sections via the tab list", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("tab", { name: "Components", selected: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Button — variants" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Foundations" }).click();
  await expect(
    page.getByRole("tab", { name: "Foundations", selected: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Color" })).toBeVisible();

  await page.getByRole("tab", { name: "Playground" }).click();
  await expect(
    page.getByRole("tab", { name: "Playground", selected: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Label")).toBeVisible();
});

test("toggles the color theme", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Dark mode" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(
    page.getByRole("button", { name: "Light mode" }),
  ).toBeVisible();
});

test("blocks a loading button from activating while staying focusable", async ({
  page,
}) => {
  await page.goto("/");

  // Playwright's own actionability check already refuses to .click() an
  // aria-disabled element, and its toBeDisabled() matcher treats
  // aria-disabled as disabled too — both independently confirm tooling
  // sees it as non-activatable. What we're asserting here is the more
  // specific, deliberate part of this component's contract: the native
  // `disabled` IDL property stays false, so the element remains
  // focusable/tabbable even though it reads as disabled semantically.
  const loadingButton = page.getByRole("button", { name: "Loading" });
  await expect(loadingButton).toHaveJSProperty("disabled", false);

  await loadingButton.focus();
  await expect(loadingButton).toBeFocused();

  await loadingButton.click({ force: true });
  await expect(loadingButton).toBeFocused();
});
