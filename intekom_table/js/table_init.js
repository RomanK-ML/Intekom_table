// Массив для хранения данных о вызовах
let calls = [];

// Функция для добавления вызова
function addCall(name, phoneNumber, date, duration) {
    calls.push({ name, phoneNumber, date, duration });
}

// Генерируем некоторые случайные данные для демонстрации
addCall("Иван", "555-1111", "2023-08-01", "3 минуты");
addCall("Мария", "555-2222", "2023-08-01", "5 минут");
addCall("Петр", "555-3333", "2023-08-01", "2 минуты");
addCall("Елена", "555-4444", "2023-08-01", "10 минут");
addCall("Алексей", "555-5555", "2023-08-01", "7 минут");

// Количество записей на одной странице
const recordsPerPage = 2;
// Номер текущей страницы
let currentPage = 1;

// Функция для отображения таблицы с учетом сортировки и постраничной навигации
function renderTable() {
    const tableBody = document.querySelector("#callTable tbody");
    tableBody.innerHTML = "";

    // Сортировка данных перед отображением таблицы
    const sortedCalls = calls.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    // Определение границ записей на текущей странице
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;

    sortedCalls.slice(startIndex, endIndex).forEach((call, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${call.name}</td>
            <td>${call.phoneNumber}</td>
            <td>${call.date}</td>
            <td>${call.duration}</td>
            <td>
                <button onclick="editCall(${index + startIndex})">Редактировать</button>
                <button onclick="deleteCall(${index + startIndex})">Удалить</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Обновление нумерации текущей страницы
    const currentPageElement = document.querySelector("#currentPage");
    currentPageElement.textContent = currentPage;
}

// Функция для сортировки таблицы по заданному полю
function sortTable(field) {
    calls.sort((a, b) => {
        return a[field].localeCompare(b[field]);
    });
    renderTable();
}

// Функция для перехода на предыдущую страницу
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// Функция для перехода на следующую страницу
function nextPage() {
    const totalPages = Math.ceil(calls.length / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// Инициализация таблицы при загрузке страницы
renderTable();
