import { test, expect } from '@playwright/test';
import { poeRoster } from '../src/mocks/poe-roster';

test.describe('Path of Exile roster', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/poe/characters', (route) => route.fulfill({ json: poeRoster }));
  });

  test('displays scheduled observations grouped by league from the landing page', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('article', { exact: true, name: 'Path of Exile' })
      .getByRole('link', { name: 'View characters' })
      .click();

    await expect(page.getByRole('heading', { name: 'My characters' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Demo league · Emberfall',
      'Demo league · Firstlight',
    ]);
    await expect(page.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByText('Regular · Archived')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ashwarden' })).toHaveCount(0);

    await page.reload();

    await expect(page.getByText('Ashwarden')).toBeVisible();
  });

  for (const width of [320, 390, 992]) {
    test(`fits ${width}px in both themes`, async ({ page }) => {
      await page.setViewportSize({ height: 900, width });
      await page.goto('/poe');

      await expect(page.getByText('Ashwarden')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

      await page.getByRole('button', { name: 'Switch to light theme' }).click();

      await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
      await expect(page.getByText('Winterglass')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }

  test('recovers from a request failure and explains an empty roster', async ({ page }) => {
    await page.route('**/api/v1/poe/characters', (route) => route.fulfill({ status: 503 }));
    await page.goto('/poe');

    await expect(page.getByRole('alert')).toContainText('Characters could not be loaded');

    await page.route('**/api/v1/poe/characters', (route) => route.fulfill({ json: { game: 'poe', groups: [] } }));
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByRole('heading', { name: 'No characters collected yet' })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });
});
