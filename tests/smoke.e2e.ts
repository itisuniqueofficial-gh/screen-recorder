import { expect, test } from '@playwright/test';

test('home page loads with app brand', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Screen Recorder/);
  await expect(
    page.getByText('Screen Recorder', { exact: true }).filter({ visible: true }).first()
  ).toBeVisible();
});

test('client-side routing renders settings page', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('client-side routing renders history page', async ({ page }) => {
  await page.goto('/history');
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
});

test('unknown routes redirect back to home', async ({ page }) => {
  await page.goto('/does-not-exist');
  await page.waitForURL('/');
  await expect(page).toHaveTitle(/Screen Recorder/);
});

test('theme toggle cycles theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Theme:/ });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', /Click to switch/);
});
