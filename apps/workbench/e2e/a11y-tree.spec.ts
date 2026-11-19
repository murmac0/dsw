import { expect, test } from "@playwright/test";

/**
 * Accessibility-tree snapshots: the roles, names, states and structure a
 * screen reader is handed. Not a substitute for listening with VoiceOver
 * or NVDA, but it catches regressions in what they would announce, such
 * as a lost group name, a missing "required", or stray empty live regions.
 */

test("composed form: fieldsets, groups, names and states", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("form", {
    has: page.getByRole("heading", { name: "Workspace settings" }),
  });
  await expect(form).toMatchAriaSnapshot(`
    - heading "Workspace settings" [level=3]
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
  await page.goto("/");
  await expect(page.getByRole("group", { name: "Billing address" })).toMatchAriaSnapshot(`
    - group "Billing address":
      - textbox "Street" [disabled]
      - textbox "City" [disabled]
  `);
});

test("destructive confirm is an alertdialog named by its title", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
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
  await page.goto("/");
  const save = page.getByRole("button", { name: "Save draft" });
  await save.click();
  await expect(save).toMatchAriaSnapshot(`- button "Save draft" [disabled]`);
  await expect(page.getByRole("status").filter({ hasText: "Loading" })).toHaveCount(1);
});
