const { test, expect } = require('@playwright/test');
const { asyncWrapProviders } = require('async_hooks');
const element = [
{
  locator: (page) =>page.locator('#firstNameError'),
  name: "firstNameError"
},
{
  locator: (page) =>page.locator('#lastNameError'),
  name: "lastNameError"
},
{
  locator: (page) =>page.locator('#phoneError'),
  name: "phoneError"
},
{
  locator: (page) =>page.locator('#dateError'),
  name: "dateError"
}
];
 test.beforeEach ( async ({page}) => {
  // Переходим на страницу с формой
await page.goto('/');
 });

test('Добавление и удаление записи в форме', async ({ page }) => {


  // Проверяем, что форма загрузилась
  await expect(page.locator('h1')).toHaveText('Форма ввода данных');
  
  // Заполняем форму корректными данными
  await page.fill('#firstName', 'Иван');
  await page.fill('#lastName', 'Петров');
  await page.fill('#phone', '123456789012');
  await page.fill('#date', '15.05.1990');

  // Нажимаем кнопку добавления
  await page.click('#addBtn');

  // Ждем появления записи в таблице
  await expect(page.locator('#recordsTable tbody tr')).toHaveCount(1);
  await expect(page.locator('#recordsTable tbody tr td').first()).toHaveText('Иван');
  
  // Проверяем, что счетчик записей обновился
  await expect(page.locator('#recordsCount')).toHaveText('1');

  // Удаляем запись
  await page.click('.delete-btn');

  // Проверяем, что запись удалилась и показалось сообщение
  await expect(page.locator('#emptyMessage')).toBeVisible();
  await expect(page.locator('#recordsCount')).toHaveText('0');
});

test('Валидация формы - пустые поля', async ({ page }) => {


  // Пытаемся отправить пустую форму
  await page.click('#addBtn');

  // Ждем немного и проверяем сообщения об ошибках
  await page.waitForTimeout(500);


  // Проверяем разными способами, так как ошибки могут показываться через display: block или display: flex
  element.forEach (({locator, name}) => {
    test.step (`Проверка валидации формы:  проверяем параметр ${name}`, async () =>{ 
 await expect(locator(page)).toBeVisible();
});
});
});

test('Валидация формы - некорректный номер', async ({ page }) => {
  

  // Заполняем обязательные поля
  test.step ('Заполняем обязательные поля', async () => {
      await page.fill('#firstName', 'Тест');
  await page.fill('#lastName', 'Тестов');
  await page.fill('#date', '01.01.2000');
  });
 // Вводим некорректный номер
test.step ('Вводим некорректный номер', async () => {
  await page.fill('#phone', '123');
  await page.click('#addBtn');
});
// Ждем немного
 await test.step ('Ждем немного', async () => {
 await page.waitForTimeout(5000);
});


// Проверяем ошибку 
test.step ('Проверяем ошибку', async () => {
 await expect(page.locator('#phoneError')).toBeVisible();
});
 

});

test('Валидация формы - корректные данные', async ({ page }) => {
  

  // Заполняем форму корректными данными
  await page.fill('#firstName', 'Мария');
  await page.fill('#lastName', 'Иванова');
  await page.fill('#phone', '123456789012');
  await page.fill('#date', '20.08.1995');

  await page.click('#addBtn');

  // Проверяем, что нет сообщений об ошибках
  await expect(page.locator('#firstNameError')).not.toBeVisible();
  await expect(page.locator('#lastNameError')).not.toBeVisible();
  await expect(page.locator('#phoneError')).not.toBeVisible();
  await expect(page.locator('#dateError')).not.toBeVisible();

  // И что запись добавилась
  await expect(page.locator('#recordsTable tbody tr')).toHaveCount(1);
});

test('Очистка всех записей', async ({ page }) => {
  

  // Добавляем запись
  await page.fill('#firstName', 'Анна');
  await page.fill('#lastName', 'Сидорова');
  await page.fill('#phone', '123456789012');
  await page.fill('#date', '10.10.1990');
  await page.click('#addBtn');

  // Ждем добавления
  await expect(page.locator('#recordsTable tbody tr')).toHaveCount(1);

  // Настраиваем обработчик диалога ДО нажатия кнопки очистки
  page.once('dialog', async dialog => {
    console.log('Диалог подтверждения:', dialog.message());
    await dialog.accept(); // Подтверждаем удаление
  });

  // Очищаем все записи
  await page.click('#clearBtn');

  // Ждем пока записи очистятся
  await page.waitForTimeout(500); // Небольшая задержка для обработки

  // Проверяем что записи очистились
  await expect(page.locator('#emptyMessage')).toBeVisible();
  await expect(page.locator('#recordsCount')).toHaveText('0');
});