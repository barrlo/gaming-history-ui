import { test, expect } from '@playwright/test';
import roster from '../contracts/v1/fixtures/populated/roster.json' with { type: 'json' };
import aeloria from '../contracts/v1/fixtures/populated/char-aeloria-current.json' with { type: 'json' };
import korren from '../contracts/v1/fixtures/populated/char-korren-current.json' with { type: 'json' };
import thalren from '../contracts/v1/fixtures/populated/char-thalren-current.json' with { type: 'json' };
import vaelis from '../contracts/v1/fixtures/populated/char-vaelis-current.json' with { type: 'json' };

const scores = [aeloria, korren, thalren, vaelis];

for (const width of [390, 992, 1280]) {
  test(`roster ranks current scores and fits both themes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ height: 900, width });
    await page.route('**/api/v1/wow/characters', (route) => route.fulfill({ json: roster }));
    await page.route('**/api/v1/wow/characters/*/current-score?*', (route) => {
      const score = scores.find((current) => route.request().url().includes(current.characterId));

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

    await page.getByRole('button', { name: 'Switch to light theme' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
    await expect(page.getByText('2,540', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('roster keeps independent errors retryable', async ({ page }) => {
  let fail = true;
  await page.route('**/api/v1/wow/characters', (route) => route.fulfill({ json: roster }));
  await page.route('**/api/v1/wow/characters/*/current-score?*', (route) => {
    const score = scores.find((current) => route.request().url().includes(current.characterId));

    return route.fulfill(fail && score?.characterId === 'char-aeloria' ? { status: 503 } : { json: score });
  });
  await page.goto('/wow');

  await expect(page.getByRole('button', { name: 'Retry score for Aeloria' })).toBeVisible();
  await expect(page.getByText('2,112', { exact: true })).toBeVisible();

  fail = false;
  await page.getByRole('button', { name: 'Retry score for Aeloria' }).click();

  await expect(page.getByText('2,540', { exact: true })).toBeVisible();
  await expect(page.getByRole('article').first()).toHaveAttribute('aria-label', 'Aeloria');
});
