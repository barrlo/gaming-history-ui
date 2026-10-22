import { test, expect } from '@playwright/test';
import { poe2Roster } from '../src/mocks/poe2-roster';

test.describe('Path of Exile 2 roster', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/poe2/characters', (route) => route.fulfill({ json: poe2Roster }));
  });

  test('shows the PoE2 league archive from its landing link', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('article', { exact: true, name: 'Path of Exile 2' })
      .getByRole('link', { name: 'View characters' })
      .click();

    await expect(page.getByRole('heading', { name: 'My characters' })).toBeVisible();
    await expect(page.getByText('Path of Exile 2 · League archive')).toBeVisible();
    await expect(page.getByText('Ashwarden')).toBeVisible();
    await expect(page.getByText('Witch', { exact: true })).toBeVisible();
    await expect(page.getByText('Warrior · Titan')).toBeVisible();
    await expect(page.getByText('Sorceress · Stormweaver')).toBeVisible();
    await expect(page.getByText('Regular · Archived')).toBeVisible();
    await expect(page.getByRole('link', { name: /Ashwarden/ })).toHaveCount(0);
  });

  test('retries its own roster endpoint after a failure', async ({ page }) => {
    await page.route('**/api/v1/poe2/characters', (route) => route.fulfill({ status: 503 }));
    await page.goto('/poe2');

    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();

    await page.route('**/api/v1/poe2/characters', (route) => route.fulfill({ json: poe2Roster }));
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByText('Ashwarden')).toBeVisible();
    await expect(page.getByText('Path of Exile 2 · League archive')).toBeVisible();
  });
});
