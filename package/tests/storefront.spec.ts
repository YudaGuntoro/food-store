import { test, expect } from "@playwright/test";

test("catalog searches, filters, displays details, and handles no results", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "jadi lebih",
  );
  const menu = page.locator("#menu");
  await expect(menu.locator("article")).toHaveCount(8);
  await menu.getByRole("button", { name: "Nasi Kebuli", exact: true }).click();
  await expect(menu.locator("article")).toHaveCount(2);
  await page
    .getByRole("button", {
      name: "Lihat detail Nasi Kebuli Ayam Rempah",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Nasi basmati");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await menu.getByRole("button", { name: "Semua Menu", exact: true }).click();
  await page.getByRole("textbox", { name: "Cari menu makanan" }).fill("snack");
  await expect(menu.locator("article")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "Cari menu makanan" })
    .fill("tidak-ada-menu");
  await expect(menu.getByText("Menu belum ditemukan.")).toBeVisible();
  await menu.getByRole("button", { name: "Lihat semua menu" }).click();
  await expect(menu.locator("article")).toHaveCount(8);
});

test("cart persists and prepares checkout without sending a fake order", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Tambah Nasi Box Ayam Nusantara ke keranjang",
      exact: true,
    })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Buka keranjang, 1 item" }).click();
  const cart = page.getByRole("dialog");
  await expect(cart).toContainText("Nasi Box Ayam Nusantara");
  await cart
    .getByRole("button", {
      name: "Tambah Nasi Box Ayam Nusantara",
      exact: true,
    })
    .click();
  await expect(cart.getByText("Rp 50.000", { exact: true })).toBeVisible();
  await cart.getByLabel("Nama pemesan").fill("Pemesan Contoh");
  await cart.getByLabel("Tanggal acara").fill("2027-05-20");
  await cart.getByLabel("Alamat pengiriman").fill("Alamat pengujian, Jakarta");
  await cart.getByLabel("Catatan").fill("Tidak pedas");
  await cart.getByRole("button", { name: "Siapkan ringkasan pesanan" }).click();
  const summary = cart.getByRole("textbox", { name: "Ringkasan pesan" });
  await expect(summary).toHaveValue(/2 × Nasi Box Ayam Nusantara/);
  await expect(summary).toHaveValue(/Pemesan Contoh/);
  await expect(cart).toContainText("Nomor WhatsApp toko belum diatur");
  await expect(
    cart.getByRole("link", { name: "Kirim ke WhatsApp" }),
  ).toHaveCount(0);
  await cart
    .getByRole("button", { name: "Hapus Nasi Box Ayam Nusantara" })
    .click();
  await expect(cart.getByText("Masih kosong, nih.")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("foodstore-cart-v1")),
  ).not.toContain("Pemesan Contoh");
});

test("consultation creates a reviewable message and dialog traps focus", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Reservasi catering FoodStore", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nama kamu").fill("Contoh Konsultasi");
  await dialog.getByLabel("Tanggal acara").fill("2027-05-20");
  await dialog.getByLabel("Jumlah tamu").fill("30");
  await dialog
    .getByLabel("Kebutuhan acara")
    .fill("Nasi box untuk rapat kantor");
  await dialog.getByRole("button", { name: "Siapkan konsultasi" }).click();
  await expect(
    dialog.getByRole("textbox", { name: "Ringkasan pesan" }),
  ).toHaveValue(/30 orang/);
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("invalid saved cart is ignored safely", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "foodstore-cart-v1",
      JSON.stringify([
        { id: "missing", quantity: 3 },
        { id: "box-ayam", quantity: -5 },
        { id: "kebuli-ayam", quantity: 10000 },
      ]),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Buka keranjang, 0 item" }).click();
  await expect(page.getByRole("dialog")).toContainText("Masih kosong, nih.");
});

test("layout fits the screen, images load, and mobile navigation works", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) {
      img.loading = "eager";
    }
    await Promise.all(Array.from(document.images).map((img) => img.decode()));
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      Array.from(document.images).every((img) => img.naturalWidth > 0),
    ),
  ).toBe(true);
  if (info.project.name === "mobile") {
    // Prevent anchor animation from racing the screenshot's return-to-top step.
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    await page.getByRole("button", { name: "Buka navigasi" }).click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Pilihan Menu" })
      .click();
    await expect(
      page.getByRole("button", { name: "Buka navigasi" }),
    ).toHaveAttribute("aria-expanded", "false");
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
  await page.screenshot({
    path: `.verify-ui/${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
    scale: "css",
  });
  await page.screenshot({
    path: `.verify-ui/${info.project.name}-viewport.png`,
    animations: "disabled",
    scale: "css",
  });
  expect(errors).toEqual([]);
});
