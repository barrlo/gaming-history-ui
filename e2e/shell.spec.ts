import { test, expect } from '@playwright/test';

test('navigation and theme remain usable on desktop and mobile', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Your gaming history' })).toBeVisible();

  await page.getByRole('button', { name: 'Switch to light theme' }).click();

  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');

  await page.setViewportSize({ height: 844, width: 390 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').getByRole('link', { exact: true, name: 'Path of Exile 2' }).click();

  await expect(page.getByRole('heading', { exact: true, name: 'Path of Exile 2' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { exact: true, name: 'Path of Exile 2' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
});

for (const width of [850, 991]) {
  test(`compact navigation keeps header controls aligned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ height: 900, width });
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Open navigation' });
    const theme = page.getByRole('button', { name: 'Switch to light theme' });

    await expect(menu).toBeVisible();
    await expect(page.getByRole('link', { exact: true, name: 'Path of Exile 2' })).toBeHidden();

    const menuBox = await menu.boundingBox();
    const themeBox = await theme.boundingBox();

    expect(menuBox).not.toBeNull();
    expect(themeBox).not.toBeNull();
    expect(Math.abs(menuBox!.y + menuBox!.height / 2 - themeBox!.y - themeBox!.height / 2)).toBeLessThan(2);
    expect(themeBox!.x + themeBox!.width).toBeLessThanOrEqual(width);

    await menu.click();

    await expect(page.getByRole('dialog').getByRole('link', { name: 'World of Warcraft' })).toBeVisible();
  });
}

for (const width of [992, 1024]) {
  test(`desktop navigation fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ height: 900, width });
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeHidden();

    const navigation = page.getByRole('link', {
      exact: true,
      name: 'Path of Exile 2',
    });
    const theme = page.getByRole('button', { name: 'Switch to light theme' });

    await expect(navigation).toBeVisible();

    const navBox = await navigation.boundingBox();
    const themeBox = await theme.boundingBox();

    expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(themeBox!.x);
    expect(themeBox!.x + themeBox!.width).toBeLessThanOrEqual(width);
    expect(Math.abs(navBox!.y + navBox!.height / 2 - themeBox!.y - themeBox!.height / 2)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
