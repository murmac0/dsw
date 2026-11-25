import { ALL_PAGES, PAGES } from "./pages";
import { expect, test } from "@playwright/test";

test("the sidebar lists every page, and the page list covers the sidebar", async ({
  page,
}) => {
  await page.goto(PAGES.overview);
  const hrefs = await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link")
    .evaluateAll((links) => links.map((a) => `/${a.getAttribute("href")}`));
  expect(hrefs).toEqual(ALL_PAGES);
});

test("navigating moves to the page: URL, title, current link, focus", async ({ page }) => {
  await page.goto(PAGES.overview);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A design system for people and their coding agents",
  );

  const nav = page.getByRole("navigation", { name: "Site" });
  await nav.getByRole("link", { name: "Tokens and themes" }).click();
  await expect(page).toHaveURL(/#\/foundations$/);
  await expect(page).toHaveTitle("Tokens and themes · Design System Workbench");
  await expect(nav.getByRole("link", { name: "Tokens and themes" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  // Focus lands on the new page's h1, so screen readers announce it.
  await expect(page.getByRole("heading", { level: 1, name: "Tokens and themes" })).toBeFocused();

  // Deep links and the back button work.
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/A design system/);
});

test("component cards link to that component's Storybook docs", async ({ page }) => {
  await page.goto(PAGES.components);
  const card = page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "Link", exact: true }),
  });
  await expect(card.getByRole("link", { name: /Link in Storybook/ })).toHaveAttribute(
    "href",
    /\?path=\/docs\/components-link--docs$/,
  );
});

test("unknown pages say so and link home", async ({ page }) => {
  await page.goto("/#/no-such-page");
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Go to the overview" }).click();
  await expect(page).toHaveURL(/#\/$/);
});

test("skip link moves focus past the navigation", async ({ page }) => {
  await page.goto(PAGES.overview);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("on phones the menu button shows and hides the sidebar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAGES.overview);
  const nav = page.getByRole("navigation", { name: "Site" });
  const menu = page.getByRole("button", { name: "Menu" });
  await expect(nav).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await nav.getByRole("link", { name: "Dialog" }).click();
  // Following a link closes the menu.
  await expect(page.getByRole("heading", { level: 1, name: "Dialog" })).toBeVisible();
  await expect(nav).toBeHidden();
});

test("toggles the color theme", async ({ page }) => {
  await page.goto(PAGES.overview);

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
  await page.goto(PAGES.button);

  // Playwright's own actionability check already refuses to .click() an
  // aria-disabled element, and its toBeDisabled() matcher treats
  // aria-disabled as disabled too — both independently confirm tooling
  // sees it as non-activatable. What we're asserting here is the more
  // specific, deliberate part of this component's contract: the native
  // `disabled` IDL property stays false, so the element remains
  // focusable/tabbable even though it reads as disabled semantically.
  const loadingButton = page.getByRole("button", { name: "Save draft" });
  await loadingButton.click();
  // Name unchanged while loading ("Save draft", not "Save draft Loading").
  await expect(loadingButton).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("status").filter({ hasText: "Loading" })).toHaveCount(1);
  await expect(loadingButton).toHaveJSProperty("disabled", false);

  await loadingButton.focus();
  await expect(loadingButton).toBeFocused();

  await loadingButton.click({ force: true });
  await expect(loadingButton).toBeFocused();

  // The demo stops on its own in under 5s (WCAG 2.2.2), keeping focus.
  await expect(loadingButton).not.toHaveAttribute("aria-disabled", "true", { timeout: 4000 });
  await expect(loadingButton).toBeFocused();
});
