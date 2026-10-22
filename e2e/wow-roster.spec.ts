import { test, expect } from '@playwright/test';
import { wowCurrentScores, wowRoster } from '../src/mocks/wow-roster';

test.describe('World of Warcraft roster', () => {
  for (const width of [390, 900, 1200]) {
    test(`roster ranks current scores and fits the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ height: 900, width });
      await page.route('**/api/v1/wow/characters', (route) => route.fulfill({ json: wowRoster }));
      await page.route('**/api/v1/wow/characters/*/current-score?*', (route) => {
        const score = wowCurrentScores.find((current) => route.request().url().includes(current.characterId));

        return route.fulfill({ json: score });
      });
      await page.goto('/wow');

      await expect(page.getByRole('heading', { name: 'My characters' })).toBeVisible();
      await expect(page.getByText('2,540', { exact: true })).toBeVisible();
      await expect(page.getByText('2,112', { exact: true })).toBeVisible();
      await expect(page.getByText('1,764', { exact: true })).toBeVisible();
      await expect(page.getByRole('article').nth(0)).toHaveAttribute('aria-label', 'Aeloria');
      await expect(page.getByRole('article').nth(3)).toHaveAttribute('aria-label', 'Korren');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }

  test('roster keeps independent errors retryable', async ({ page }) => {
    await page.route('**/api/v1/wow/characters', (route) => route.fulfill({ json: wowRoster }));
    await page.route('**/api/v1/wow/characters/*/current-score?*', (route) => {
      const score = wowCurrentScores.find((current) => route.request().url().includes(current.characterId));

      return route.fulfill(score?.characterId === 'char-aeloria' ? { status: 503 } : { json: score });
    });
    await page.goto('/wow');

    await expect(page.getByRole('button', { name: 'Retry score for Aeloria' })).toBeVisible();
    await expect(page.getByText('2,112', { exact: true })).toBeVisible();

    await page.route('**/api/v1/wow/characters/char-aeloria/current-score?*', (route) =>
      route.fulfill({ json: wowCurrentScores[0] }),
    );
    await page.getByRole('button', { name: 'Retry score for Aeloria' }).click();

    await expect(page.getByText('2,540', { exact: true })).toBeVisible();
    await expect(page.getByRole('article').first()).toHaveAttribute('aria-label', 'Aeloria');
  });
});
