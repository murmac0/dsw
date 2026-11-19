import { expect, test } from "@playwright/test";

test("fieldsets name their groups in the accessibility tree", async ({ page }) => {
  await page.goto("/");
  const shipping = page.getByRole("group", { name: "Shipping address" });
  const billing = page.getByRole("group", { name: "Billing address" });
  // Same-labelled fields are reachable, and distinguishable, by group.
  await expect(shipping.getByRole("textbox", { name: "Street" })).toBeVisible();
  await expect(billing.getByRole("textbox", { name: "Street" })).toBeVisible();
  await expect(shipping).toHaveAccessibleDescription("Where we send your order.");
});

test("one prop disables a whole group, natively and visually", async ({ page }) => {
  await page.goto("/");
  const billing = page.getByRole("group", { name: "Billing address" });
  const street = billing.getByRole("textbox", { name: "Street" });
  const same = page.getByText("Billing address is the same as shipping");

  await expect(street).toBeDisabled();
  // Disabled styling, not just inertness: the field reads as disabled.
  const cursor = await street.evaluate((el) => getComputedStyle(el).cursor);
  expect(cursor).toBe("not-allowed");

  await same.click();
  await expect(street).toBeEnabled();
  await street.fill("2 Bill Rd");
  await expect(street).toHaveValue("2 Bill Rd");

  await same.click();
  await expect(street).toBeDisabled();
});

test("a required CheckboxGroup blocks submit until one option is chosen", async ({
  page,
}) => {
  await page.goto("/");
  const form = page.locator("form", {
    has: page.getByRole("heading", { name: "Workspace settings" }),
  });
  const channels = form.getByRole("group", { name: "Notify me by" });

  await form.getByRole("textbox", { name: "Billing email" }).fill("billing@acme.test");
  await form.getByText("I agree to the terms").click();
  // Untick the only default channel, then try to save.
  await channels.getByText("Email", { exact: true }).click();
  await form.getByRole("button", { name: "Save changes" }).click();

  await expect(channels).toHaveAccessibleDescription(/Choose at least one channel/);
  await expect(page.getByText(/^Saved at/)).toHaveCount(0);

  await channels.getByText("SMS", { exact: true }).click();
  await form.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(/^Saved at/)).toBeVisible();
});
