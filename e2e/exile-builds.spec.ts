import { test, expect } from '@playwright/test';
import { poeBuilds } from '../src/mocks/poe-builds';
import { poe2Builds } from '../src/mocks/poe2-builds';
import { poeRoster } from '../src/mocks/poe-roster';
import { poe2Roster } from '../src/mocks/poe2-roster';

test.describe('Exile character builds', () => {
  for (const { characterId, fixtures, game, roster } of [
    { characterId: 'c'.repeat(64), fixtures: poeBuilds, game: 'poe', roster: poeRoster },
    { characterId: 'd'.repeat(64), fixtures: poe2Builds, game: 'poe2', roster: poe2Roster },
  ]) {
    test(`opens ${game} builds from the roster and selects a historical build`, async ({ page }) => {
      const latest = fixtures.latest.find((entry) => entry.build.character.id === characterId)!;
      const snapshots = fixtures.snapshots.filter((entry) => entry.build.character.id === characterId);
      await page.route(`**/api/v1/${game}/characters`, (route) => route.fulfill({ json: roster }));
      await page.route(`**/api/v1/${game}/characters/*/build`, (route) => route.fulfill({ json: latest }));
      await page.route(`**/api/v1/${game}/characters/*/snapshots`, (route) =>
        route.fulfill({ json: { nextCursor: null, snapshots: snapshots.map((entry) => entry.snapshot) } }),
      );
      await page.route(`**/api/v1/${game}/characters/*/snapshots/*`, (route) => route.fulfill({ json: snapshots[1] }));
      await page.goto(`/${game}`);
      await page.getByRole('link', { name: latest.build.character.name }).click();

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(latest.build.character.name);
      await expect(page.getByRole('region', { name: 'Ascendancy skills' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Update', exact: true })).toHaveCount(0);

      await page.getByRole('combobox', { name: 'Build history' }).selectOption(snapshots[1].snapshot.id);

      await expect(
        page.getByText(`Level ${snapshots[1].build.character.level} · ${snapshots[1].build.character.class}`, {
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.getByRole('region', { name: 'Ascendancy skills' })).toHaveCount(0);

      await page.getByRole('button', { name: 'Back to Latest' }).click();

      await expect(page.getByRole('region', { name: 'Ascendancy skills' })).toBeVisible();
    });
  }

  for (const width of [390, 900, 1200]) {
    test(`supports independent disclosure and fits at ${width}px`, async ({ page }) => {
      const latest = poeBuilds.latest.find((entry) => entry.build.character.id === 'c'.repeat(64))!;
      await page.setViewportSize({ height: 900, width });
      await page.route('**/api/v1/poe/characters/*/build', (route) => route.fulfill({ json: latest }));
      await page.route('**/api/v1/poe/characters/*/snapshots', (route) =>
        route.fulfill({ json: { nextCursor: null, snapshots: [] } }),
      );
      await page.goto(`/poe/characters/${latest.build.character.id}`);
      const equipment = page.getByRole('region', { name: 'Equipped items' });

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(latest.build.character.name);

      const item = equipment.getByRole('button', { name: /Ember Ward/ });

      await expect(item).toHaveAttribute('aria-expanded', 'false');

      await item.click();

      await expect(equipment.getByText('+20 to maximum Life')).toBeVisible();

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }

  test('allows mobile sections to expand independently', async ({ page }) => {
    const latest = poeBuilds.latest.find((entry) => entry.build.character.id === 'c'.repeat(64))!;
    await page.setViewportSize({ height: 900, width: 390 });
    await page.route('**/api/v1/poe/characters/*/build', (route) => route.fulfill({ json: latest }));
    await page.route('**/api/v1/poe/characters/*/snapshots', (route) =>
      route.fulfill({ json: { nextCursor: null, snapshots: [] } }),
    );
    await page.goto(`/poe/characters/${latest.build.character.id}`);
    const skills = page.getByRole('button', { name: 'Skills & linked supports' });

    await expect(skills).toHaveAttribute('aria-expanded', 'false');

    await skills.click();

    await expect(skills).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Equipped items', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
