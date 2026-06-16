import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

async function resetHcm(page: import('@playwright/test').Page) {
  await page.request.post('/api/hcm/dev/chaos', {
    data: { action: 'reset' },
  });
}

async function loginAs(page: import('@playwright/test').Page, name: string) {
  await page.goto('/login');
  await page.getByRole('button', { name: new RegExp(name, 'i') }).click();
}

test('employee submits request and manager approves', async ({ page }) => {
  await resetHcm(page);

  await loginAs(page, 'Alex Rivera');
  await expect(page).toHaveURL(/\/employee\/balances/);

  await page.goto('/employee/requests/new');
  await expect(page.getByRole('heading', { name: 'Request time off' })).toBeVisible();

  const startField = page.getByRole('textbox', { name: 'Start date' });
  const endField = page.getByRole('textbox', { name: 'End date' });

  await startField.fill('07/15/2026');
  await startField.blur();

  await endField.fill('07/16/2026');
  await endField.blur();

  await expect(page.getByRole('textbox', { name: 'Days requested' })).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Submit request' })).toBeEnabled();

  await page.getByRole('button', { name: 'Submit request' }).click();

  await expect(page.getByText('Awaiting manager')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL('/login');

  await loginAs(page, 'Morgan Lee');
  await expect(page).toHaveURL(/\/manager\/approvals/);

  await page.getByRole('button', { name: /Alex Rivera/i }).first().click();
  await expect(page.getByText('Review request')).toBeVisible();

  await page.getByRole('button', { name: 'Approve' }).click();

  await expect(page.getByText(/approved alex rivera/i)).toBeVisible({ timeout: 15_000 });
});
