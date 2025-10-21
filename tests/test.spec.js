const { test, expect } = require('@playwright/test');

test('Добавление и удаление записи в форме', async ({ page }) => {
  // Переходим на страницу с формой
  await page.goto('/');

  // Проверяем, что форма загрузилась
  await expect(page.locator('h1')).toHaveText('Форма ввода данных');
  
  // Заполняем форму
  await page.fill('#firstName', 'Иван');
  await page.fill('#lastName', 'Петров');
  await page.fill('#phone', '123456789012');
  await page.fill('#date', '15.05.1990');

  // Нажимаем кнопку добавления
  await page.click('#addBtn');

  // Проверяем, что запись добавилась в таблицу
  await expect(page.locator('#recordsTable tbody tr')).toHaveCount(1);
  await expect(page.locator('#recordsTable tbody tr td').first()).toHaveText('Иван');
  
  // Проверяем, что счетчик записей обновился
  await expect(page.locator('#recordsCount')).toHaveText('1');

  // Удаляем запись
  await page.click('.delete-btn');

  // Проверяем, что запись удалилась
  await expect(page.locator('#emptyMessage')).toBeVisible();
  await expect(page.locator('#recordsCount')).toHaveText('0');
});

test('Валидация формы', async ({ page }) => {
  await page.goto('/');

  // Пытаемся отправить пустую форму
  await page.click('#addBtn');

  // Проверяем, что появились сообщения об ошибках
  await expect(page.locator('#firstNameError')).toBeVisible();
  await expect(page.locator('#lastNameError')).toBeVisible();
  await expect(page.locator('#phoneError')).toBeVisible();
  await expect(page.locator('#dateError')).toBeVisible();

  // Проверяем некорректный номер телефона
  await page.fill('#phone', '123');
  await page.click('#addBtn');
  await expect(page.locator('#phoneError')).toBeVisible();
});

test('Очистка всех записей', async ({ page }) => {
  await page.goto('/');

  // Добавляем несколько записей
  await page.fill('#firstName', 'Мария');
  await page.fill('#lastName', 'Иванова');
  await page.fill('#phone', '123456789012');
  await page.fill('#date', '20.08.1995');
  await page.click('#addBtn');

  // Проверяем что записи есть
  await expect(page.locator('#recordsTable tbody tr')).toHaveCount(1);

  // Очищаем все записи
  await page.click('#clearBtn');
  
  // Подтверждаем диалог
  page.once('dialog', dialog => dialog.accept());

  // Проверяем что записи очистились
  await expect(page.locator('#emptyMessage')).toBeVisible();
});