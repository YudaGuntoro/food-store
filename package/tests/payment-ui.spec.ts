import { test, expect } from "@playwright/test";

test("sandbox checkout validates form, reports setup errors and preserves cart", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("foodstore-cart-v1", JSON.stringify([{ id: "box-ayam", quantity: 2 }])));
  let requests = 0;
  await page.route("**/api/payments/sandbox", async route => {
    requests++;
    const body = route.request().postDataJSON();
    expect(body.items).toEqual([{ id: "box-ayam", quantity: 2 }]);
    expect(body.name).toBe("Pembeli Sandbox");
    expect(body).not.toHaveProperty("total");
    await route.fulfill({ status: 503, json: { error: "Midtrans Sandbox belum dikonfigurasi." } });
  });
  await page.goto("/cara-pesan");
  await page.getByRole("button", { name: "Buka keranjang, 2 item" }).click();
  const dialog = page.getByRole("dialog");
  const pay = dialog.getByRole("button", { name: "Coba bayar di Sandbox" });
  await pay.click(); expect(requests).toBe(0);
  await dialog.getByLabel("Nama pemesan").fill("Pembeli Sandbox");
  await dialog.getByLabel("Tanggal acara").fill("2099-05-20");
  await page.keyboard.press("Escape");
  await dialog.getByLabel("Alamat pengiriman").fill("Alamat uji Jakarta");
  await pay.click();
  await expect(dialog.getByRole("alert")).toContainText("belum dikonfigurasi");
  await expect(dialog.getByLabel("Nama pemesan")).toHaveValue("Pembeli Sandbox");
  await expect(pay).toBeEnabled();
  await expect(page.getByRole("button", { name: "Buka keranjang, 2 item" })).toBeAttached();
});

test("cart clears only after backend confirms paid, ignoring success query", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("foodstore-cart-v1", JSON.stringify([{ id: "box-ayam", quantity: 2 }])));
  let paid = false;
  await page.route("**/api/payments/sandbox/status", route => route.fulfill({ json: { orderId: "FS-SB-test-order", total: 50000, state: paid ? "paid" : "pending", redirectUrl: paid ? undefined : "https://app.sandbox.midtrans.com/snap/v4/redirection/test" } }));
  await page.goto("/pembayaran?transaction_status=settlement&status_code=200");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Menunggu pembayaran");
  await expect(page.getByRole("button", { name: "Buka keranjang, 2 item" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lanjutkan pembayaran" })).toHaveAttribute("href", /app\.sandbox\.midtrans\.com/);
  paid = true;
  await page.getByRole("button", { name: "Periksa status", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Simulasi pembayaran berhasil!");
  await expect(page.getByRole("link", { name: "Lanjutkan pembayaran" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Buka keranjang, 0 item" })).toBeVisible();
  await expect(page.locator(".cart-count")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("paid items are removed once while other items and later additions survive refresh", async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    if (!localStorage.getItem("foodstore-cart-v1")) localStorage.setItem("foodstore-cart-v1", JSON.stringify([{ id: "box-ayam", quantity: 3 }, { id: "snack-klasik", quantity: 1 }]));
  });
  await page.route("**/api/payments/sandbox/status", route => route.fulfill({ json: { orderId: "FS-SB-paid-cart-test", total: 50000, state: "paid", items: [{ id: "box-ayam", quantity: 2 }] } }));
  await page.goto("/pembayaran", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Buka keranjang, 2 item" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("foodstore-cart-v1")!))).toEqual([{ id: "box-ayam", quantity: 1 }, { id: "snack-klasik", quantity: 1 }]);
  await page.goto("/#menu", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Buka keranjang, 2 item" })).toBeVisible();
  await page.getByRole("button", { name: "Tambah Nasi Box Ayam Nusantara ke keranjang", exact: true }).click();
  await expect(page.getByRole("button", { name: "Buka keranjang, 3 item" })).toBeVisible();
  await page.goto("/pembayaran", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Simulasi pembayaran berhasil!");
  await expect(page.getByRole("button", { name: "Buka keranjang, 3 item" })).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Simulasi pembayaran berhasil!");
  await expect(page.getByRole("button", { name: "Buka keranjang, 3 item" })).toBeVisible();
});

test("failed and expired transactions leave the cart intact", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("foodstore-cart-v1", JSON.stringify([{ id: "box-ayam", quantity: 2 }])));
  let state = "failed";
  await page.route("**/api/payments/sandbox/status", route => route.fulfill({ json: { orderId: "FS-SB-failed-test", total: 50000, state, items: [{ id: "box-ayam", quantity: 2 }] } }));
  await page.goto("/pembayaran");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pembayaran tidak berhasil");
  await expect(page.getByRole("button", { name: "Buka keranjang, 2 item" })).toBeVisible();
  state = "expired";
  await page.getByRole("button", { name: "Periksa status", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pembayaran kedaluwarsa");
  await expect(page.getByRole("button", { name: "Buka keranjang, 2 item" })).toBeVisible();
});

test("successful checkout opens the hosted sandbox payment page", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("foodstore-cart-v1", JSON.stringify([{ id: "box-ayam", quantity: 1 }])));
  const target = "https://app.sandbox.midtrans.com/snap/v4/redirection/foodstore-ui-test";
  await page.route("**/api/payments/sandbox", route => route.fulfill({ json: { redirectUrl: target } }));
  await page.route(target, route => route.fulfill({ contentType: "text/html", body: "<h1>Hosted sandbox payment test</h1>" }));
  await page.goto("/cara-pesan");
  await page.getByRole("button", { name: "Buka keranjang, 1 item" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nama pemesan").fill("Pembeli Sandbox");
  await dialog.getByLabel("Tanggal acara").fill("2099-05-20");
  await page.keyboard.press("Escape");
  await dialog.getByLabel("Alamat pengiriman").fill("Alamat uji Jakarta");
  await dialog.getByRole("button", { name: "Coba bayar di Sandbox" }).click();
  await page.waitForURL(target);
  await expect(page.getByRole("heading", { name: "Hosted sandbox payment test" })).toBeVisible();
});

test("status errors stay explicit without claiming success", async ({ page }) => {
  await page.route("**/api/payments/sandbox/status", route => route.fulfill({ status: 401, json: { error: "Sesi pembayaran tidak ditemukan atau sudah kedaluwarsa." } }));
  await page.goto("/pembayaran?transaction_status=settlement");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Status belum dapat dipastikan");
  await expect(page.getByText("Sesi pembayaran tidak ditemukan atau sudah kedaluwarsa.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Lanjutkan pembayaran" })).toHaveCount(0);
});
