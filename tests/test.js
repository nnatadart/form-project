// tests/test.js
const { test, expect } = require('@playwright/test');

test('Форма должна отображаться корректно', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Проверяем наличие основных элементов
  await expect(page.locator('h1')).toContainText('Форма ввода данных');
  await expect(page.locator('#firstName')).toBeVisible();
  await expect(page.locator('#lastName')).toBeVisible();
  await expect(page.locator('#phone')).toBeVisible();
  await expect(page.locator('#date')).toBeVisible();
  await expect(page.locator('#addBtn')).toBeVisible();
  await expect(page.locator('#clearBtn')).toBeVisible();
});

test('Валидация номера телефона', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const phoneInput = page.locator('#phone');
  
  // Вводим невалидный номер
  await phoneInput.fill('123');
  await page.locator('#addBtn').click();
  
  // Должна появиться ошибка
  await expect(page.locator('#phoneError')).toBeVisible();
  await expect(page.locator('#phoneError')).toContainText('12 цифр');
  
  // Вводим валидный номер
  await phoneInput.fill('123456789012');
  await expect(page.locator('#phoneError')).not.toBeVisible();
});

test('Валидация даты', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const dateInput = page.locator('#date');
  
  // Невалидная дата
  await dateInput.fill('99.99.9999');
  await page.locator('#addBtn').click();
  await expect(page.locator('#dateError')).toBeVisible();
  
  // Валидная дата
  await dateInput.fill('31.12.1990');
  await expect(page.locator('#dateError')).not.toBeVisible();
});

test('Добавление записи', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Заполняем форму
  await page.locator('#firstName').fill('Иван');
  await page.locator('#lastName').fill('Петров');
  await page.locator('#phone').fill('123456789012');
  await page.locator('#date').fill('15.05.1985');
  
  // Добавляем запись
  await page.locator('#addBtn').click();
  
  // Проверяем что запись появилась в таблице
  await expect(page.locator('#recordsTable')).toBeVisible();
  await expect(page.locator('#recordsBody tr')).toContainText(['Иван', 'Петров', '123456789012', '15.05.1985']);
});

test('Удаление записи', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Сначала добавляем запись
  await page.locator('#firstName').fill('Мария');
  await page.locator('#lastName').fill('Сидорова');
  await page.locator('#phone').fill('987654321098');
  await page.locator('#date').fill('20.10.1990');
  await page.locator('#addBtn').click();
  
  // Удаляем запись
  await page.locator('.delete-btn').first().click();
  
  // Проверяем что запись удалилась
  await expect(page.locator('#emptyMessage')).toBeVisible();
});

test('Очистка всех записей', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Добавляем несколько записей
  await page.locator('#firstName').fill('Тест');
  await page.locator('#lastName').fill('Тестов');
  await page.locator('#phone').fill('111111111111');
  await page.locator('#date').fill('01.01.2000');
  await page.locator('#addBtn').click();
  
  // Очищаем все
  await page.locator('#clearBtn').click();
  
  // Подтверждаем в диалоге
  page.on('dialog', dialog => dialog.accept());
  
  // Проверяем что таблица пустая
  await expect(page.locator('#emptyMessage')).toBeVisible();
});

test('LocalStorage сохраняет данные', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Добавляем запись
  await page.locator('#firstName').fill('Алексей');
  await page.locator('#lastName').fill('Иванов');
  await page.locator('#phone').fill('999999999999');
  await page.locator('#date').fill('10.10.2010');
  await page.locator('#addBtn').click();
  
  // Перезагружаем страницу
  await page.reload();
  
  // Проверяем что данные сохранились
  await expect(page.locator('#recordsTable')).toBeVisible();
  await expect(page.locator('#recordsBody tr')).toContainText(['Алексей', 'Иванов']);
});