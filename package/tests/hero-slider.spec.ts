import { test, expect } from "@playwright/test";

test("mouse drag follows the pointer, settles on a slide, and keeps clicks working", async ({
  page,
}) => {
  await page.goto("/");
  const slider = page.getByRole("region", { name: "Pilihan banner FoodStore" });
  const stage = slider.locator(".hero-stage");
  const slides = slider.locator(".hero-slide");
  const box = await stage.boundingBox();
  if (!box) throw new Error("Banner is missing");
  const x = box.x + box.width * 0.7;
  const y = box.y + box.height * 0.45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - box.width * 0.3, y, { steps: 12 });
  await expect(stage).toHaveClass(/is-dragging/);
  expect(
    await slider
      .locator(".hero-track")
      .evaluate(
        (element) => new DOMMatrix(getComputedStyle(element).transform).m41,
      ),
  ).toBeLessThan(-box.width * 0.2);
  await page.mouse.up();
  await expect(slides.nth(1)).toHaveAttribute("aria-hidden", "false");
  await expect(stage).not.toHaveClass(/is-dragging/);
  expect(new URL(page.url()).hash).toBe("");
  // Finish the settling animation before the next gesture.
  await expect
    .poll(() =>
      slider
        .locator(".hero-track")
        .evaluate((element) =>
          Math.round(new DOMMatrix(getComputedStyle(element).transform).m41),
        ),
    )
    .toBe(-Math.round(box.width));
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 12, y, { steps: 4 });
  await page.mouse.up();
  await expect(slides.nth(1)).toHaveAttribute("aria-hidden", "false");
  expect(new URL(page.url()).hash).toBe("");
  await expect
    .poll(() =>
      slider
        .locator(".hero-track")
        .evaluate((element) =>
          Math.round(new DOMMatrix(getComputedStyle(element).transform).m41),
        ),
    )
    .toBe(-Math.round(box.width));
  await slides.nth(1).getByRole("link").click();
  await expect(page.locator("#menu article")).toHaveCount(2);
});

test("three image banners rotate, pause, navigate, and open the matching catalog", async ({
  page,
}, info) => {
  await page.clock.install();
  await page.goto("/");
  const slider = page.getByRole("region", { name: "Pilihan banner FoodStore" });
  const slides = slider.locator(".hero-slide");
  await expect(slides).toHaveCount(3);
  await expect(slides.nth(0)).toHaveAttribute("aria-hidden", "false");
  await page.mouse.move(0, 0);
  await page.clock.fastForward(6100);
  await expect(slides.nth(1)).toHaveAttribute("aria-hidden", "false");
  await slider.getByRole("button", { name: "Banner berikutnya" }).click();
  await expect(slides.nth(2)).toHaveAttribute("aria-hidden", "false");
  await slider.getByRole("button", { name: "Banner sebelumnya" }).click();
  await expect(slides.nth(1)).toHaveAttribute("aria-hidden", "false");
  await slider
    .getByRole("button", { name: "Tampilkan banner 3:", exact: false })
    .click();
  await expect(
    slider.getByRole("button", { name: "Jeda slider otomatis" }),
  ).toHaveCount(0);
  await page.mouse.move(0, 0);
  await page.clock.fastForward(10000);
  await expect(slides.nth(2)).toHaveAttribute("aria-hidden", "false");
  const source = await slides
    .nth(2)
    .locator("img")
    .evaluate((image: HTMLImageElement) => image.currentSrc);
  expect(source.includes("-mobile.webp")).toBe(info.project.name === "mobile");
  await slider
    .getByRole("button", { name: "Tampilkan banner 2:", exact: false })
    .click();
  await slides.nth(1).getByRole("link").click();
  await expect(page.locator("#menu article")).toHaveCount(2);
  await expect(
    page
      .locator("#menu")
      .getByRole("button", { name: "Nasi Kebuli", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion disables automatic banner changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  const slider = page.getByRole("region", { name: "Pilihan banner FoodStore" });
  await expect(
    slider.getByRole("button", { name: "Jeda slider otomatis" }),
  ).toHaveCount(0);
  await page.clock.fastForward(15000);
  await expect(slider.locator(".hero-slide").nth(0)).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  await slider.getByRole("button", { name: "Banner berikutnya" }).click();
  await expect(slider.locator(".hero-slide").nth(1)).toHaveAttribute(
    "aria-hidden",
    "false",
  );
});
