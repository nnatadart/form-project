// Конфигурация
const STORAGE_KEY = 'formRecords';

// Элементы DOM
const form = document.getElementById('dataForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const recordsBody = document.getElementById('recordsBody');
const emptyMessage = document.getElementById('emptyMessage');
const recordsTable = document.getElementById('recordsTable');
const storageInfo = document.getElementById('storageInfo');
const recordsCount = document.getElementById('recordsCount');
const githubLink = document.getElementById('githubLink');

// Элементы ошибок
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const phoneError = document.getElementById('phoneError');
const dateError = document.getElementById('dateError');

// Массив для хранения записей
let records = [];

// ========== LOCALSTORAGE ФУНКЦИИ ==========

/**
 * Загружает данные из localStorage
 */
function loadRecords() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных', 'error');
        return [];
    }
}

/**
 * Сохраняет данные в localStorage
 */
function saveRecords(records) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        updateStorageInfo();
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        showNotification('Ошибка при сохранении данных', 'error');
    }
}

/**
 * Обновляет информацию о количестве записей
 */
function updateStorageInfo() {
    const count = records.length;
    recordsCount.textContent = count;
    recordsCount.style.fontWeight = 'bold';
    recordsCount.style.color = count > 0 ? '#4CAF50' : '#666';
}

// ========== ВАЛИДАЦИЯ ==========

/**
 * Проверяет номер телефона (12 цифр)
 */
function validatePhone(phone) {
    const phoneRegex = /^\d{12}$/;
    return phoneRegex.test(phone);
}

/**
 * Проверяет дату в формате ДД.ММ.ГГГГ
 */
function validateDate(date) {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
    if (!dateRegex.test(date)) return false;
    
    // Дополнительная проверка на корректность даты
    const parts = date.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getDate() === day && 
           dateObj.getMonth() === month - 1 && 
           dateObj.getFullYear() === year;
}

/**
 * Проверяет всю форму
 */
function validateForm() {
    let isValid = true;
    
    // Сбрасываем все ошибки
    [firstNameError, lastNameError, phoneError, dateError].forEach(error => {
        error.style.display = 'none';
    });
    
    // Проверка имени
    if (!firstNameInput.value.trim()) {
        firstNameError.style.display = 'block';
        isValid = false;
    }
    
    // Проверка фамилии
    if (!lastNameInput.value.trim()) {
        lastNameError.style.display = 'block';
        isValid = false;
    }
    
    // Проверка номера
    if (!validatePhone(phoneInput.value)) {
        phoneError.style.display = 'block';
        isValid = false;
    }
    
    // Проверка даты
    if (!validateDate(dateInput.value)) {
        dateError.style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

// ========== РАБОТА С ЗАПИСЯМИ ==========

/**
 * Добавляет новую запись
 */
function addRecord() {
    if (!validateForm()) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    const record = {
        id: Date.now(),
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        phone: phoneInput.value,
        date: dateInput.value,
        createdAt: new Date().toISOString()
    };
    
    records.push(record);
    saveRecords(records);
    updateRecordsDisplay();
    form.reset();
    
    showNotification('Запись успешно добавлена!', 'success');
}

/**
 * Удаляет запись по ID
 */
function deleteRecord(id) {
    const recordToDelete = records.find(record => record.id === id);
    records = records.filter(record => record.id !== id);
    saveRecords(records);
    updateRecordsDisplay();
    
    showNotification(`Запись ${recordToDelete.firstName} ${recordToDelete.lastName} удалена`, 'info');
}

/**
 * Очищает все записи
 */
function clearAllRecords() {
    if (records.length === 0) {
        showNotification('Нет записей для удаления', 'info');
        return;
    }
    
    if (confirm(`Вы уверены, что хотите удалить все записи (${records.length})?`)) {
        records = [];
        saveRecords(records);
        updateRecordsDisplay();
        showNotification('Все записи удалены', 'info');
    }
}

/**
 * Обновляет отображение записей в таблице
 */
function updateRecordsDisplay() {
    recordsBody.innerHTML = '';
    
    if (records.length === 0) {
        recordsTable.style.display = 'none';
        emptyMessage.style.display = 'block';
    } else {
        recordsTable.style.display = 'table';
        emptyMessage.style.display = 'none';
        
        // Сортируем записи по дате создания (новые сверху)
        const sortedRecords = [...records].sort((a, b) => b.id - a.id);
        
        sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${record.firstName}</td>
                <td>${record.lastName}</td>
                <td>${record.phone}</td>
                <td>${record.date}</td>
                <td>
                    <button class="delete-btn" data-id="${record.id}" title="Удалить запись">✕</button>
                </td>
            `;
            
            recordsBody.appendChild(row);
        });
        
        // Добавляем обработчики событий для кнопок удаления
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteRecord(id);
            });
        });
    }
}

// ========== УВЕДОМЛЕНИЯ ==========

/**
 * Показывает уведомление
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateX(100%);
        background-color: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

/**
 * Инициализация приложения
 */
function init() {
    // Загружаем записи из localStorage
    records = loadRecords();
    
    // Обновляем интерфейс
    updateRecordsDisplay();
    updateStorageInfo();
    
    // Обработчики событий для кнопок
    addBtn.addEventListener('click', addRecord);
    clearBtn.addEventListener('click', clearAllRecords);
    
    // Валидация в реальном времени для номера
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 12) {
            this.value = this.value.substring(0, 12);
        }
    });
    
    // Автоформатирование даты
    dateInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '.' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '.' + value.substring(5);
        }
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        this.value = value;
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addRecord();
    });
    
    // Показываем уведомление о localStorage при первом посещении
    if (!localStorage.getItem('storageNotified')) {
        setTimeout(() => {
            showNotification('Все данные сохраняются локально в вашем браузере', 'info');
            localStorage.setItem('storageNotified', 'true');
        }, 1000);
    }
    
    console.log('Приложение инициализировано successfully!');
}

// Запускаем приложение когда DOM загружен
document.addEventListener('DOMContentLoaded', init);