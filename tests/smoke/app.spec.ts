import { expect, test } from "@playwright/test";

test("opens the model homepage and research modules", async ({ page }) => {
  await page.goto(".");
  await expect(page.getByRole("heading", { name: "Second Cast Interactive Model" }))
    .toBeVisible();
  await page.getByLabel("Panel scenario").selectOption("kingStud");
  await expect(page.getByText("168 kg", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Trace optimized mass" }).click();
  await expect(page.getByText("approximately 156 kg.", { exact: true })).toBeVisible();
  await expect(page.locator("mark")).toContainText("approximately 156 kg.");

  await page.getByRole("link", { name: "Research Modules" }).click();
  await expect(page.getByRole("heading", { name: "Extended Second Cast Scenarios" }))
    .toBeVisible();
  await page.getByLabel("Research module").selectOption("thermal");
  await expect(page.getByText("Experimental Thermal / Operational Inputs"))
    .toBeVisible();
});

test("serves the thesis PDF under the repository base path", async ({ request }) => {
  const response = await request.get("docs/ACADIA_2026_Second_Cast.pdf");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});
