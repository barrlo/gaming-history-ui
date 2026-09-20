import { test, expect } from '@playwright/test';
import roster from '../contracts/v1/fixtures/poe-expansion/poe2-roster.json' with { type: 'json' };

for (const width of [390, 992]) {
  test(`PoE2 roster loads collected characters at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ height: 844, width });
    await page.route('**/api/v1/poe2/characters', (route) => route.fulfill({ json: roster }));
    await page.goto('/');
    await page
      .getByRole('article', { exact: true, name: 'Path of Exile 2' })
      .getByRole('link', { name: 'View characters' })
      .click();

    await expect(page.getByRole('heading', { name: 'My characters' })).toBeVisible();
    await expect(page.getByText('Ashwarden')).toBeVisible();
    await expect(page.getByText('Witch', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ashwarden/ })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    await page.getByRole('button', { name: 'Switch to light theme' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
    await expect(page.getByText('Ashwarden')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('PoE2 roster failure can be retried without showing PoE characters', async ({ page }) => {
  await page.route('**/api/v1/poe2/characters', (route) => route.fulfill({ json: {}, status: 503 }));
  await page.goto('/poe2');

  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();

  await page.route('**/api/v1/poe2/characters', (route) => route.fulfill({ json: roster }));
  await page.getByRole('button', { name: 'Try again' }).click();

  await expect(page.getByText('Ashwarden')).toBeVisible();
  await expect(page.getByText('Path of Exile 2 · League archive')).toBeVisible();
});
