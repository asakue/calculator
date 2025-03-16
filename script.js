// Глобальные переменные
let memory = 0;
let history = [];
let isAdvancedMode = false;
let isDarkTheme = false;

// DOM элементы
const display = document.getElementById('result');
const historyDisplay = document.getElementById('history');
const advancedFunctions = document.getElementById('advancedFunctions');
const historyList = document.getElementById('historyItems');
const memoryDisplay = document.getElementById('memoryValue');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadHistory();
    setupKeyboardEvents();
});

// Основные функции калькулятора
function addChar(char) {
    if (display.value === '0' || display.value === '') {
        display.value = char;
    } else {
        display.value += char;
    }
}

function addFunction(func) {
    display.value += func;
}

function clearDisplay() {
    display.value = '';
    historyDisplay.textContent = '';
}

function deleteChar() {
    if (display.value.length > 0) {
        display.value = display.value.slice(0, -1);
    }
}

function calculate() {
    const expression = display.value.trim();
    if (!expression) {
        showNotification('Введите выражение');
        return;
    }

    try {
        let processedExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(');

        if (processedExpression.includes('!')) {
            processedExpression = calculateFactorial(processedExpression);
        }

        const result = math.evaluate(processedExpression);
        historyDisplay.textContent = expression;
        display.value = formatResult(result);

        addToHistory(expression, result);

    } catch (error) {
        showNotification('Ошибка в выражении');
    }
}

// Вспомогательные функции
function formatResult(result) {
    if (Number.isInteger(result)) {
        return result.toString();
    }
    return Number(result.toFixed(8)).toString();
}

function calculateFactorial(expression) {
    if (!expression) return '';

    const regex = /(\d+)!/g;
    return expression.replace(regex, (match, number) => {
        return factorial(parseInt(number));
    });
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// Управление историей
function addToHistory(expression, result) {
    if (!expression || !result) return;

    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString()
    };
    history.unshift(historyItem);
    if (history.length > 10) history.pop();
    updateHistoryDisplay();
    saveHistory();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.expression} = ${item.result}`;
        historyList.appendChild(li);
    });
}

// Работа с памятью
function memoryAdd() {
    memory += parseFloat(display.value) || 0;
    updateMemoryDisplay();
}

function memorySubtract() {
    memory -= parseFloat(display.value) || 0;
    updateMemoryDisplay();
}

function memoryRecall() {
    display.value = memory.toString();
}

function memoryClear() {
    memory = 0;
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    memoryDisplay.textContent = memory;
}

// Управление темой
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('calculator-theme', isDarkTheme ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme) {
        isDarkTheme = savedTheme === 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        const themeToggleButton = document.querySelector('.theme-toggle');
        themeToggleButton.setAttribute('aria-pressed', isDarkTheme);
    }
}

// Уведомления
function showNotification(message) {
    if (!message) return;

    notificationText.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Клавиатурные события
function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (key === 'Shift') return;

        if (key >= '0' && key <= '9' || key === '.') {
            addChar(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            addChar(key);
        } else if (key === 'Enter') {
            calculate();
        } else if (key === 'Escape') {
            clearDisplay();
        } else if (key === 'Backspace') {
            deleteChar();
        } else if (key.toLowerCase() === 'm') {
            memoryAdd();
        } else if (key.toLowerCase() === 'r') {
            memoryRecall();
        }

        event.preventDefault();
    });
}
// Сохранение и загрузка истории
function saveHistory() {
    localStorage.setItem('calculator-history', JSON.stringify(history));
}

function loadHistory() {
    const savedHistory = localStorage.getItem('calculator-history');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Переключение режимов
function toggleAdvancedMode() {
    isAdvancedMode = !isAdvancedMode;
    advancedFunctions.classList.toggle('active');
    const advancedToggleButton = document.querySelector('.advanced-toggle');
    advancedToggleButton.setAttribute('aria-expanded', isAdvancedMode);
}

function toggleHotkeys() {
    const hotkeysPopup = document.getElementById('hotkeysPopup');
    hotkeysPopup.classList.toggle('active');
}

// Инициализация обработчиков событий для кнопок
document.querySelector('.advanced-toggle').addEventListener('click', toggleAdvancedMode);
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
document.querySelector('.hotkeys-toggle').addEventListener('click', toggleHotkeys);