import { test, expect } from '@playwright/test';

test('main user flow runs a review and shows outputs', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Local Multi-Agent Review Workbench' })).toBeVisible();
  await expect(page.getByText('Current provider')).toBeVisible();

  await page.getByRole('button', { name: 'Run Review' }).click();

  await expect(page.getByText('Review Run #')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Run Artifacts' })).toBeVisible();

  await expect(page.locator('#finalSynthesisCard')).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator('#finalSynthesisSummary')).toHaveText(
    'Mosaic completed a deterministic synthesizer review.',
  );

  await expect(page.getByRole('heading', { name: 'Final Synthesis' })).toBeVisible();
  await expect(page.locator('#finalSynthesisNextStep')).toContainText('Recommended Next Step');
  await page.getByRole('button', { name: /show \d+ files/i }).click();
  await expect(page.locator('#artifactPanel')).toContainText('mosaic-output.md');
  await expect(page.locator('#runProgress')).toContainText('4/4 steps completed');
});
