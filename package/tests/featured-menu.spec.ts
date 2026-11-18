import { test, expect } from '@playwright/test';

test('featured menu tabs, keyboard navigation, product detail and cart work', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('#menu-unggulan');
  const newTab = section.getByRole('tab', { name: 'New Menu', exact: true });
  const bestTab = section.getByRole('tab', { name: 'Best Seller', exact: true });
  await expect(newTab).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel').locator('article')).toHaveCount(6);
  await newTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(bestTab).toBeFocused();
  await expect(bestTab).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel').locator('article')).toHaveCount(6);
  await section.getByRole('button', { name: 'Lihat Nasi Box Ayam Nusantara dari Best Seller', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Nasi Box Ayam Nusantara');
  await dialog.getByRole('button', { name: 'Tambah ke keranjang' }).click();
  await expect(page.getByRole('button', { name: 'Buka keranjang, 1 item' })).toBeVisible();
  await bestTab.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(newTab).toHaveAttribute('aria-selected', 'true');
  await section.getByRole('tab', { name: 'Best Seller' }).click();
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('#menu-unggulan [role="tabpanel"]:not([hidden]) img'));
    images.forEach(image => { image.loading = 'eager'; });
    await Promise.all(images.map(image => image.decode()));
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await section.screenshot({ path: `.verify-ui/featured-${info.project.name}.png`, animations: 'disabled', scale: 'css' });
});
