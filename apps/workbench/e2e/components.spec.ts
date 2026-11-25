import { PAGES } from "./pages";
import { expect, test } from "@playwright/test";

test("Select opens a listbox and commits a choice with the keyboard", async ({
  page,
}) => {
  await page.goto(PAGES.select);

  const trigger = page.getByRole("button", { name: /Country/ }).first();
  await trigger.focus();
  await page.keyboard.press("Enter");

  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(listbox).toBeHidden();
  await expect(trigger).toHaveText(/New Zealand|Ireland/);
  await expect(trigger).toBeFocused();
});

test("Dialog traps focus, closes on Escape and restores focus", async ({
  page,
}) => {
  await page.goto(PAGES.dialog);

  const trigger = page.getByRole("button", { name: "Open dialog" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Invite teammates" });
  await expect(dialog).toBeVisible();

  // Tab repeatedly: focus must never leave the dialog.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const inside = await dialog.evaluate((el) =>
      el.contains(document.activeElement),
    );
    expect(inside).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("alertdialog is not dismissed by clicking the backdrop", async ({
  page,
}) => {
  await page.goto(PAGES.form);

  await page.getByRole("button", { name: "Delete workspace" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Delete workspace?" });
  await expect(dialog).toBeVisible();

  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});

test("composed form blocks submit and shows linked errors until valid", async ({
  page,
}) => {
  await page.goto(PAGES.form);

  const email = page.getByRole("textbox", { name: "Billing email" });
  const save = page.getByRole("button", { name: "Save changes" });
  const status = page.getByText(/^Saved at/);

  await email.fill("nope");
  await save.click();
  await expect(email).toHaveAccessibleDescription(/Enter a valid email address/);
  await expect(status).toHaveCount(0);

  await email.fill("billing@acme.test");
  // The native input is visually hidden (React Aria's pattern), so act on
  // the visible label like a user would, then assert on the semantics.
  await page.getByText("I agree to the terms").click();
  await expect(
    page.getByRole("checkbox", { name: "I agree to the terms" }),
  ).toBeChecked();
  await save.click();
  await expect(status).toBeVisible();
});

test("portaled overlays inherit the active theme", async ({ page }) => {
  await page.goto(PAGES.dialog);
  await page.getByRole("button", { name: "Dark mode" }).click();
  await page.getByRole("button", { name: "Open dialog" }).click();

  // Dialog is portaled to <body>; if the theme were scoped to a wrapper
  // element it would render with the light surface (#ffffff).
  const surface = await page
    .getByRole("dialog", { name: "Invite teammates" })
    .evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor);
  expect(surface).not.toBe("rgb(255, 255, 255)");
});

test("controlled demo: parent state drives every control", async ({ page }) => {
  await page.goto(PAGES.controlled);
  const readout = page.getByTestId("controlled-state");
  const section = page.locator("section", {
    has: page.getByRole("heading", { name: "Controlled", exact: true }),
  });

  await section.getByRole("textbox", { name: "Name" }).fill("Grace");
  await section.getByText("Team", { exact: true }).click();
  await section.getByText("Accept terms").click();
  await expect(readout).toContainText('"name": "Grace"');
  await expect(readout).toContainText('"plan": "team"');
  await expect(readout).toContainText('"terms": true');

  await section.getByRole("button", { name: "Reset from parent" }).click();
  await expect(section.getByRole("textbox", { name: "Name" })).toHaveValue("");
  await expect(section.getByRole("radio", { name: "Free" })).toBeChecked();
  await expect(
    section.getByRole("checkbox", { name: "Accept terms" }),
  ).not.toBeChecked();

  await section.getByRole("button", { name: "Open controlled dialog" }).click();
  await expect(readout).toContainText('"isOpen": true');
  await page.keyboard.press("Escape");
  await expect(readout).toContainText('"isOpen": false');
});

test("an example's code is its real source, highlighted, behind Show code", async ({ page }) => {
  await page.goto(PAGES.button);
  const toggle = page.getByRole("button", { name: "Show code: Variants.tsx" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(page.getByRole("button", { name: "Hide code: Variants.tsx" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  const code = page.locator("code", { hasText: "export default function Variants()" });
  await expect(code).toContainText('<Button variant="secondary">Secondary</Button>');
  // Syntax roles are painted: "import" isn't the plain text colour.
  const colours = await code.evaluate((el) => {
    const keyword = [...el.querySelectorAll("span")].find((s) => s.textContent === "import");
    return [getComputedStyle(el).color, keyword && getComputedStyle(keyword).color];
  });
  expect(colours[1]).toBeTruthy();
  expect(colours[1]).not.toBe(colours[0]);
  await expect(page.getByRole("button", { name: "Copy Variants.tsx" })).toBeVisible();
});

test("the settings example previews at phone width in a themed frame", async ({ page }) => {
  await page.goto(PAGES.settings);
  await page.getByRole("radio", { name: "Volt", exact: true }).click();
  await page.getByText("Phone (375px)").click();
  const frame = page.getByTitle("Settings page at phone (375px)");
  await expect(frame).toHaveAttribute("width", "375");
  const inside = page.frameLocator('iframe[title="Settings page at phone (375px)"]');
  await expect(inside.getByRole("heading", { name: "Settings", level: 2 })).toBeVisible();
  await expect(inside.locator("html")).toHaveAttribute("data-brand", "volt");
});
