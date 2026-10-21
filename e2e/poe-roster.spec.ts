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

  for (const width of [390, 900, 1200]) {
    test(`fits ${width}px in the default dark theme`, async ({ page }) => {
      await page.setViewportSize({ height: 900, width });
      await page.goto('/poe');

      await expect(page.getByText('Ashwarden')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

      await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
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

test.describe('Browser-local roster dates', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

  test('uses the browser timezone for dates and changes the timezone label with daylight saving time', async ({
    page,
  }) => {
    const roster = structuredClone(poeRoster);
    roster.groups[0].startAt = '2026-01-15T02:00:00Z';
    roster.groups[0].characters[0].observedAt = '2026-01-15T08:00:00Z';
    roster.groups[0].characters[1].observedAt = '2026-07-15T08:00:00Z';
    await page.route('**/api/v1/poe/characters', (route) => route.fulfill({ json: roster }));
    await page.goto('/poe');

    await expect(page.getByText('Latest collected builds. Times shown in America/New_York.')).toBeVisible();
    await expect(page.getByText('Started Jan 14, 2026')).toBeVisible();
    await expect(page.getByText('Collected Jan 15, 2026, 3:00 AM EST')).toBeVisible();
    await expect(page.getByText('Collected Jul 15, 2026, 4:00 AM EDT')).toBeVisible();
  });
});
