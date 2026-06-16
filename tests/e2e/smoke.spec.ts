import { test, expect } from '@playwright/test';

test('home page loads and shows demo login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Time off, without payroll surprises' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try the demo' })).toBeVisible();
});

test('employee can open login and see demo users', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Alex Rivera')).toBeVisible();
  await expect(page.getByText('Morgan Lee')).toBeVisible();
});
