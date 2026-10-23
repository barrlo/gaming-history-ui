import { test, expect } from '@playwright/test';
import { wowHistories } from '../src/mocks/wow-history';
import { wowCurrentScores, wowRoster } from '../src/mocks/wow-roster';

test.describe('World of Warcraft history', () => {
  test.use({ hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/wow/characters', (route) => route.fulfill({ json: wowRoster }));
    await page.route('**/api/v1/wow/characters/*/history?*', (route) => route.fulfill({ json: wowHistories[0] }));
    await page.route('**/api/v1/wow/characters/*/current-score?*', (route) =>
      route.fulfill({ json: wowCurrentScores[0] }),
    );
  });

  for (const width of [390, 900, 1200]) {
    test(`shows weekly history and a distinct current point at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ height: 1000, width });
      await page.goto('/wow/characters/char-aeloria');

      await expect(page.getByRole('heading', { name: 'Aeloria' })).toBeVisible();
      await expect(page.getByText('+178', { exact: true })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Mythic+ score history' })).toBeVisible();
      await expect(page.getByText('Last completed week: 2,362')).toBeVisible();
      await expect(page.getByRole('application')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

      await page.screenshot({ fullPage: true, path: test.info().outputPath('history.png') });
    });
  }

  test('allows keyboard users to reach the Current tooltip', async ({ page }) => {
    await page.goto('/wow/characters/char-aeloria');

    await expect(page.getByText('2,540', { exact: true })).toBeVisible();

    const chart = page.getByRole('application');
    await chart.focus();

    for (let index = 0; index < 8; index++) {
      await chart.press('ArrowRight');
    }

    await expect(page.getByRole('tooltip')).toContainText('Current');
    await expect(page.getByRole('tooltip')).toContainText('2,540');
  });

  test('allows touch users to inspect the Current point', async ({ page }) => {
    await page.setViewportSize({ height: 1000, width: 390 });
    await page.goto('/wow/characters/char-aeloria');

    await expect(page.getByText('2,540', { exact: true })).toBeVisible();

    // The SVG marker has no individual accessible role; use the application-owned marker ID.
    await page.getByTestId('current-score-point').tap();

    await expect(page.getByRole('tooltip')).toContainText('Current');
    await expect(page.getByRole('tooltip')).toContainText('2,540');
  });

  test('opens from the roster and retries current without losing weekly history', async ({ page }) => {
    await page.route('**/api/v1/wow/characters/*/current-score?*', (route) => route.fulfill({ status: 503 }));
    await page.goto('/wow');
    await page.getByRole('link', { name: 'Aeloria' }).click();

    await expect(page.getByRole('alert')).toContainText('Saved weekly history is still available');
    await expect(page.getByRole('region', { name: 'Mythic+ score history' })).toBeVisible();

    await page.route('**/api/v1/wow/characters/*/current-score?*', (route) =>
      route.fulfill({ json: wowCurrentScores[0] }),
    );
    await page.getByRole('button', { name: 'Retry current score' }).click();

    await expect(page.getByText('2,540', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'All characters' }).click();

    await expect(page).toHaveURL('/wow');
  });
});
