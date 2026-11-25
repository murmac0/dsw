import { PAGES } from "./pages";
import { expect, test } from "@playwright/test";

/**
 * Accessibility-tree snapshots: the roles, names, states and structure a
 * screen reader is handed. Not a substitute for listening with VoiceOver
 * or NVDA, but it catches regressions in what they would announce, such
 * as a lost group name, a missing "required", or stray empty live regions.
 */

test("composed form: fieldsets, groups, names and states", async ({ page }) => {
  await page.goto(PAGES.form);
  const form = page.locator("form", {
    has: page.getByRole("heading", { name: "Workspace settings" }),
  });
  await expect(form).toMatchAriaSnapshot(`
    - heading "Workspace settings" [level=2]
    - group "Workspace":
      - textbox "Workspace name": Acme
      - button /Europe \\(Frankfurt\\) Region/
    - group "Billing":
      - textbox "Billing email"
      - radiogroup "Plan":
        - radio "Free"
        - radio "Pro" [checked]
        - radio "Team"
    - group "Notifications":
      - group /Notify me by ?, required/:
        - checkbox "Email" [checked]
        - checkbox "SMS"
        - checkbox "Push"
      - switch "Email me product updates" [checked]
    - checkbox "I agree to the terms"
    - button "Save changes"
    - button "Delete workspace"
  `);
  // Exactly one live region: the form's own "Saved at" status. Buttons
  // that can't load no longer each add an empty one.
  await expect(form.getByRole("status")).toHaveCount(1);
});

test("a disabled fieldset exposes every field as disabled", async ({ page }) => {
  await page.goto(PAGES.fieldset);
  await expect(page.getByRole("group", { name: "Billing address" })).toMatchAriaSnapshot(`
    - group "Billing address":
      - textbox "Street" [disabled]
      - textbox "City" [disabled]
  `);
});

test("destructive confirm is an alertdialog named by its title", async ({ page }) => {
  await page.goto(PAGES.form);
  await page.getByRole("button", { name: "Delete workspace" }).click();
  await expect(page.getByRole("alertdialog")).toMatchAriaSnapshot(`
    - alertdialog "Delete workspace?":
      - heading "Delete workspace?" [level=2]
      - text: /permanently deletes Acme/
      - button "Cancel"
      - button "Delete"
  `);
});

test("brand switcher is a radiogroup; each brand is described", async ({ page }) => {
  await page.goto(PAGES.overview);
  await expect(page.getByRole("radiogroup", { name: "Brand" })).toMatchAriaSnapshot(`
    - radiogroup "Brand":
      - radio "Iris" [checked]
      - radio "Volt"
      - radio "Bloom"
  `);
  await expect(page.getByRole("radio", { name: "Volt", exact: true })).toHaveAccessibleDescription(
    "Neo-brutalist, acid lime",
  );
});

test("a loading button keeps its name and announces loading", async ({ page }) => {
  await page.goto(PAGES.button);
  const save = page.getByRole("button", { name: "Save draft" });
  await save.click();
  await expect(save).toMatchAriaSnapshot(`- button "Save draft" [disabled]`);
  await expect(page.getByRole("status").filter({ hasText: "Loading" })).toHaveCount(1);
});

test("example page: outline, tabs, named list and announced save", async ({ page }) => {
  await page.goto(PAGES.settings);
  // Children match in order but aren't exhaustive, so the docs page's own
  // heading, intro and pager around the example don't need listing.
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - main:
      - heading /Example. a settings page/ [level=1]
      - heading "Settings" [level=2]
      - text: Pro plan
      - paragraph: Manage how the Acme workspace works for everyone in it.
      - tablist "Settings sections":
        - tab "General" [selected]
        - tab "Members"
        - tab "Billing"
      - tabpanel "General":
        - heading "Workspace" [level=3]
        - paragraph: Shown to everyone you invite.
        - text: Workspace name
        - textbox "Workspace name": Acme
        - text: Workspace URL
        - textbox "Workspace URL": acme
        - text: /acme\\.dsw\\.app/
        - button "Europe (Frankfurt) Data region"
        - text: Default language
        - button "English Default language"
        - button "Save changes"
        - status
        - heading "Notifications" [level=3]
        - paragraph: What we email workspace admins about.
        - switch "Weekly usage summary" [checked]
        - text: Weekly usage summary
        - switch "New member joins" [checked]
        - text: New member joins
        - switch "Product updates"
        - text: Product updates
        - region "Danger zone":
          - heading "Danger zone" [level=3]
          - paragraph: /Deleting the workspace removes/
          - button "Delete workspace"
  `);
  await expect(page.getByRole("textbox", { name: "Workspace URL" })).toHaveAccessibleDescription(
    /changing it breaks old links/,
  );

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Settings saved" })).toHaveText(
    /Success: Settings saved/,
  );

  await page.getByRole("tab", { name: "Members" }).click();
  const members = page.getByRole("list", { name: "Members" });
  await expect(members.getByRole("listitem")).toHaveCount(4);
  // Repeated "Remove" buttons are told apart by name.
  await expect(page.getByRole("button", { name: "Remove Grace Hopper" })).toBeVisible();

  await page.getByRole("tab", { name: "Billing" }).click();
  await expect(page.getByRole("list", { name: "Plans" }).getByRole("heading", { level: 4 })).toHaveText([
    "Free",
    "Pro",
    "Team",
  ]);
  await expect(page.getByRole("link", { name: "Billing FAQ (opens in a new tab)" })).toBeVisible();
});
