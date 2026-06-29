import { test, expect } from '@playwright/test';

test.describe('lesson flow', () => {
  test('catalog → track → lesson → complete', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /lesson catalog|catálogo/i })).toBeVisible();

    await page
      .getByRole('link')
      .filter({ hasText: /programmers|programadores/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/tracks\/programmers/);

    const lessonLink = page.getByRole('link').filter({ hasText: /001|curly|chaves/i }).first();
    await expect(lessonLink).toBeVisible();
    await lessonLink.click();
    await expect(page).toHaveURL(/\/lessons\//);

    const passage = await page.getByTestId('lesson-passage').getAttribute('data-passage');
    expect(passage).toBeTruthy();

    await page.locator('input[aria-label="Typing input"]').focus();
    for (const char of passage!) {
      await page.keyboard.press(char === '\n' ? 'Enter' : char);
    }

    await expect(page.getByRole('heading', { name: /lesson complete|lição completa|lección completada/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await expect(
      page.getByRole('heading', { name: /settings|configurações|ajustes/i }),
    ).toBeVisible();
  });
});
