import { test, expect } from '@playwright/test';

test('Проверка заголовка на главной странице', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toContainText('Форма ввода данных');
});