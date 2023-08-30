// Конструктор класса TabulatorTable, который инициализирует таблицу и настраивает параметры.
function TabulatorTable(apiUrl, containerId, tableHeight, rowsPerPage, rowsPerPageOptions, columnsConfig) {
    // Установка значений по умолчанию, если параметры не переданы.
    this.apiUrl = apiUrl || "http://localhost:3000/api/data";   // URL для получения данных.
    this.dataLabels = "server"; // По умолчанию загрузка данных с сервера.
    this.rowsPerPage = rowsPerPage || 10;   // Количество строк на странице.
    this.rowsPerPageOptions = rowsPerPageOptions || [10, 25, 50, 100];  // Варианты количества строк на странице.
    this.table = null;  // Объект для хранения таблицы Tabulator.
    this.isEditing = false; // Флаг, указывающий на режим редактирования строки.
    this.isAdding = false;  // Флаг, указывающий на режим добавления новой строки.
    this.editRowId = 2; // Идентификатор строки, которая находится в режиме редактирования.
    this.containerId = containerId; // Идентификатор контейнера, в котором будет размещена таблица.
    this.tableHeight = tableHeight || "400px";  // Высота таблицы. Если не передана, используется высота 400px.
    this.tableOptions = {}; // Настройки таблицы.

    // Если переданы конфигурации столбцов, используем их вместо "server".
    if (columnsConfig && columnsConfig !== "server") {
        this.dataLabels = columnsConfig;
    }

    var self = this;

    // Загрузка данных с сервера, если dataLabels установлено в "server".
    if (this.dataLabels === "server") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.apiUrl, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                var data = JSON.parse(xhr.responseText);
                self.dataLabels = data.dataLabels;  // Загружаем метки столбцов с сервера.
                self.setupTable();  // Инициализация таблицы.
                self.initEvents();  // Инициализация событий.
            } else {
                console.error("Произошла ошибка:", xhr.statusText);
            }
        };
        xhr.send();
    } else {
        this.setupTable();  // Инициализация таблицы.
        this.initEvents();  // Инициализация событий.
    }
}

// Метод для настройки таблицы.
TabulatorTable.prototype.setupTable = function () {
    var self = this;

    // Функция для определения, какие ячейки можно редактировать в зависимости от режима (редактирование или добавление).
    function isCellEditable(cell) {
        // Если происходит добавление новой строки, редактируются только ячейки новой строки.
        if (self.isAdding) {
            return !!cell.getRow().getElement().getAttribute("data-add-row");
        }
        // Если происходит редактирование, редактируются ячейки только редактируемой строки.
        else if (self.isEditing === true) {
            return cell.getRow().getData().id === self.editRowId;
        }
        return false;
    }


    // Настройка столбцов таблицы на основе меток данных.
    for (var i = 0; i < this.dataLabels.length; i++) {
        var column = this.dataLabels[i];
        column.editable = isCellEditable;   // Установка редактируемости столбца в соответствии с определенной функцией.
        column.align = "center";    // Выравнивание содержимого столбца по центру.
    }


    // Настройки для создания и инициализации таблицы.
    this.tableOptions = {
        placeholder: "Нет данных",  // Место для отображения, если таблица пуста.
        pagination: "remote",   // Пагинация на стороне сервера.
        langs: {    // Локализация элементов пагинации.
            "ru-ru": {
                "pagination": {
                    "first": "В начало",
                    "last": "В конец",
                    "prev": "Предыдущая",
                    "next": "Следующая",
                    "all": "Все",
                    "page_size": "Показывать по"
                }
            }
        },
        locale: "ru-ru",
        ajaxURL: this.apiUrl,   // URL для запросов к серверу.
        paginationSize: this.rowsPerPage,   // Количество строк на одной странице.
        paginationSizeSelector: this.rowsPerPageOptions,    // Варианты количества строк на странице.
        // Обработка ответа от сервера
        ajaxResponse: function (url, params, response) {
            // Очистка фильтрации при получении новых данных.
            if (self.table instanceof Tabulator) {
                self.table.clearFilter();

                // Очистка строки поиска, если существует.
                var inputContainer = document.getElementById(self.containerId + "-search");
                if (inputContainer) {
                    inputContainer.value = "";
                }
            }
            return response;    // Возвращение данных от сервера.
        },
        ajaxContentType: "json", // Тип контента для запросов к серверу (JSON).
        virtualDom: true, // Включение виртуального DOM для оптимизации отображения.
        virtualDomBuffer: 200, // Количество строк, предзагружаемых в виртуальный DOM.
        height: this.tableHeight, // Высота таблицы, заданная в конструкторе.
        reactiveData: true, // Включение реактивных данных для автоматического обновления таблицы.
        history: true, // Включение возможности истории изменений таблицы.
        index: "id", // Поле, используемое как уникальный идентификатор строки.
        layout: "fitColumns", // Раскладка таблицы, которая подстраивает ширину столбцов чтобы они идеально вписывались в доступную ширину таблицы.
        headerFilterPlaceholder: "Поиск...", // Текстовое поле для поиска в заголовке столбца.
        columnMinWidth: 100, // Минимальная ширина столбца.
        columns: (function () {
            // Создание столбца "Действия", который будет содержать кнопки для редактирования и удаления.
            var actionsColumn = {
                title: "Действия",
                width: "200",
                align: "center",
                // Форматтер для ячейки "Действия", в котором создаются кнопки.
                formatter: function () {
                    // HTML-код кнопок с атрибутами data-action для определения действия.
                    return "<button data-action='accept' hidden>Принять</button><button data-action='cancel' hidden>Отменить</button><button data-action='edit'>Редактировать</button><button data-action='delete'>Удалить</button>";
                },
                // Обработчик клика на ячейке "Действия".
                cellClick: function (e, cell) {
                    var action = e.target.getAttribute("data-action");  // Получение действия из атрибута кнопки.
                    var rowElement = cell.getRow().getElement();
                    var buttons, button, buttonAction, isUndo;


                    // Обработка действия "Редактировать".
                    if (action === "edit") {

                        self.highlightEditingRow(cell.getRow()) // Выделение редактируемой строки.

                        self.table.modules.history.clear(); // Очистка истории изменений.
                        self.isEditing = true;  // Установка режима редактирования.
                        self.disablePaginationClicks(); // Отключение кнопок пагинации.
                        self.editRowId = cell.getRow().getData().id;    // Запоминание идентификатора редактируемой строки.
                    }
                    // Обработка действия "Принять".
                    else if (action === "accept") {
                        if (self.isAdding) {
                            cell.getRow().getElement().removeAttribute("data-add-row"); // Удаление атрибута добавления.
                            // Отправка изменений на сервер
                            //
                            //
                            //
                            //

                            // Применение временного идентификатора (для демонстрации).
                            var newId = 99
                            cell.getRow().getData().id = newId

                            // Перерисовка таблицы с обновленными данными.
                            self.table.redraw(true)
                        }

                        self.enablePaginationClicks();  // Включение кнопок пагинации.
                        self.unHighlightEditingRow()    // Снятие выделения редактируемой строки.

                        self.isEditing = false; // Завершение режима редактирования.
                        self.isAdding = false; // Завершение режима добавления.

                        // Отправка изменений на сервер
                        //
                        //
                        //
                        //

                    }
                    // Обработка действия "Отменить".
                    else if (action === "cancel") {
                        if (self.isAdding) {
                            cell.getRow().delete(); // Удаление строки при добавлении.
                        } else {
                            isUndo = true;
                            while (isUndo) {
                                isUndo = self.table.undo(); // Отмена последнего изменения.
                            }
                        }

                        self.enablePaginationClicks();  // Включение кнопок пагинации.
                        self.unHighlightEditingRow()    // Снятие выделения редактируемой строки.

                        self.isEditing = false; // Завершение режима редактирования.
                        self.isAdding = false; // Завершение режима добавления.
                    }
                    // Обработка действия "Удалить".
                    else if (action === "delete") {
                        self.isEditing = false; // Завершение режима редактирования.
                        // Отправка изменений на сервер
                        //
                        //
                        //
                        cell.getRow().delete(); // Удаление строки.
                    }
                }
            };
            // Конкатенация меток данных с созданным столбцом "Действия".
            return this.dataLabels.concat([actionsColumn]);
        }.bind(this))()
    };

    // Создание заголовочной панели.
    this.addHeaderPanel();

    // Создание контейнера для размещения таблицы и инициализация объекта таблицы Tabulator.
    var dataTableContainer = document.createElement("div"); // Создание нового элемента <div>.
    dataTableContainer.className = this.containerId + "-data-table";    // Присвоение класса элементу для стилизации.
    document.getElementById(this.containerId).appendChild(dataTableContainer);  // Добавление контейнера в родительский элемент.
    this.table = new Tabulator(dataTableContainer, this.tableOptions);  // Инициализация объекта таблицы Tabulator с передачей контейнера и опций.
};

// Метод для добавления заголовочной панели в контейнер таблицы.
TabulatorTable.prototype.addHeaderPanel = function () {
    var headerPanel = document.createElement("div"); // Создание элемента <div> для заголовочной панели.
    headerPanel.style.maxWidth = "100%"; // Установка максимальной ширины панели.
    headerPanel.className= "headerPanel"; // Установка класса панели.

    var button = document.createElement("button"); // Создание элемента <button> для кнопки "Добавить пользователя".
    button.setAttribute("type", "button"); // Установка атрибута "type" как "button".
    button.setAttribute("id", this.containerId + "-addUser"); // Установка идентификатора кнопки на основе контейнера.
    button.appendChild(document.createTextNode("Добавить пользователя")); // Добавление текста на кнопку.
    headerPanel.appendChild(button); // Добавление кнопки в заголовочную панель.

    var input = document.createElement("input"); // Создание элемента <input> для текстового поля поиска.
    input.setAttribute("placeholder", "Поиск..."); // Установка текста-подсказки в поле ввода.
    input.setAttribute("type", "text"); // Установка типа поля как текстовое.
    input.setAttribute("id", this.containerId + "-search"); // Установка идентификатора поля на основе контейнера.
    input.setAttribute("required", ""); // Установка атрибута "required" для обязательного заполнения.
    input.setAttribute("minlength", "4"); // Установка минимальной длины вводимого текста.
    input.setAttribute("size", "10"); // Установка ширины поля в символах.
    headerPanel.appendChild(input); // Добавление поля поиска в заголовочную панель.

    document.getElementById(this.containerId).appendChild(headerPanel); // Добавление заголовочной панели в родительский контейнер таблицы.
};

// Метод для инициализации событий взаимодействия с таблицей.
TabulatorTable.prototype.initEvents = function () {
    var self = this; // Сохранение ссылки на текущий объект для доступа внутри обработчиков событий.

    var searchInput = document.getElementById(this.containerId + "-search"); // Получение элемента поля поиска по его идентификатору.
    var addUserInput = document.getElementById(this.containerId + "-addUser"); // Получение элемента кнопки "Добавить пользователя".

    searchInput.addEventListener("input", handleInput); // Добавление обработчика события "input" для поля поиска.

    // Функция-обработчик для события "input" поля поиска.
    function handleInput(event) {
        var searchQuery = event.target.value; // Получение введенного пользователем запроса.
        if (searchQuery.length > 0) {
            self.search(searchQuery); // Вызов метода поиска с передачей запроса.
        }
    }

    // Добавление обработчика события "click" для кнопки "Добавить пользователя".
    addUserInput.addEventListener("click", function (event) {
        self.isAdding = true; // Установка флага добавления новой строки.
        self.table.scrollToRow(self.table.getRows()[0], "center", false); // Прокрутка к верхней строке таблицы.
        self.table.addRow({}, true).then(function (row) {
            self.disablePaginationClicks(); // Отключение пагинации.

            row.getElement().setAttribute("data-add-row", "true"); // Установка атрибута для новой строки.

            self.highlightEditingRow(row); // Выделение редактируемой строки.
        });
    }.bind(this)); // Привязка контекста текущего объекта к обработчику события.
};

// Метод для отключения элементов управления пагинацией и кнопки "Добавить пользователя".
TabulatorTable.prototype.disablePaginationClicks = function () {
    var tabulatorPageElements = document.getElementById(this.containerId).querySelectorAll(".tabulator-page, .tabulator-page-size"); // Получение элементов управления пагинацией.
    var addUserButton = document.getElementById(this.containerId + "-addUser"); // Получение кнопки "Добавить пользователя".

    addUserButton.disabled = true; // Отключение кнопки "Добавить пользователя".

    // Проход по всем элементам управления пагинацией и их отключение.
    for (var i = 0; i < tabulatorPageElements.length; i++) {
        var element = tabulatorPageElements[i];
        element.disabled = true; // Отключение элемента управления.
    }
};

// Метод для включения элементов управления пагинацией и кнопки "Добавить пользователя".
TabulatorTable.prototype.enablePaginationClicks = function () {
    var tabulatorPageElements = document.getElementById(this.containerId).querySelectorAll(".tabulator-page, .tabulator-page-size"); // Получение элементов управления пагинацией.
    var addUserButton = document.getElementById(this.containerId + "-addUser"); // Получение кнопки "Добавить пользователя".

    addUserButton.disabled = false; // Включение кнопки "Добавить пользователя".

    var currentPage = this.table.getPage(); // Получение текущей страницы.
    var maxPage = this.table.getPageMax(); // Получение максимальной страницы.

    // Проход по всем элементам управления пагинацией для их включения.
    for (var i = 0; i < tabulatorPageElements.length; i++) {
        var element = tabulatorPageElements[i];
        element.disabled = false; // Включение элемента управления.

        var dataPage = element.getAttribute("data-page"); // Получение атрибута "data-page".

        // Проверка атрибута "data-page" для элементов "first" и "prev".
        if (dataPage === "first" || dataPage === "prev") {
            if (currentPage === 1) {
                element.disabled = true; // Отключение, если текущая страница - первая.
            }
        }
        // Проверка атрибута "data-page" для элементов "next" и "last".
        else if (dataPage === "next" || dataPage === "last") {
            if (currentPage === maxPage) {
                element.disabled = true; // Отключение, если текущая страница - последняя.
            }
        }
    }
};

// Метод для выделения строки в режиме редактирования.
TabulatorTable.prototype.highlightEditingRow = function (rowHighlight) {
    var allRows = this.table.getRows(); // Получение всех строк таблицы.

    // Проход по всем строкам для отключения кнопок и изменения цвета фона.
    for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];
        var buttons = row.getElement().querySelectorAll('[data-action]'); // Получение всех кнопок в строке.

        // Проход по всем кнопкам для их отключения.
        for (var j = 0; j < buttons.length; j++) {
            var button = buttons[j];
            button.disabled = true; // Отключение кнопки.
        }

        // Изменение цвета фона строки на темный.
        row.getElement().style.backgroundColor = "rgba(48,48,48,0.8)";
    }

    var highlightButtons = rowHighlight.getElement().querySelectorAll('[data-action]'); // Получение кнопок выделенной строки.

    // Проход по кнопкам выделенной строки для их включения и скрытия.
    for (var k = 0; k < highlightButtons.length; k++) {
        var highlightButton = highlightButtons[k];
        var highlightButtonAction = highlightButton.getAttribute('data-action'); // Получение атрибута data-action.
        highlightButton.disabled = false; // Включение кнопки.
        highlightButton.hidden = !(highlightButtonAction === "accept" || highlightButtonAction === "cancel"); // Скрытие ненужных кнопок.
    }

    // Изменение цвета фона выделенной строки на светлый.
    rowHighlight.getElement().style.backgroundColor = "rgb(182, 188, 206)";
};


// Метод для снятия выделения с редактируемой строки.
TabulatorTable.prototype.unHighlightEditingRow = function () {
    var allRows = this.table.getRows(); // Получение всех строк таблицы.

    // Проход по всем строкам для включения кнопок, отмены скрытия и сброса цвета фона.
    for (var m = 0; m < allRows.length; m++) {
        var row = allRows[m];
        var buttons = row.getElement().querySelectorAll('[data-action]'); // Получение всех кнопок в строке.

        // Проход по всем кнопкам строки для их включения и отмены скрытия.
        for (var n = 0; n < buttons.length; n++) {
            var button = buttons[n];
            var buttonAction = button.getAttribute('data-action'); // Получение атрибута data-action.
            button.disabled = false; // Включение кнопки.
            button.hidden = !(buttonAction === "edit" || buttonAction === "delete"); // Отмена скрытия ненужных кнопок.
        }

        row.getElement().style.backgroundColor = ""; // Сброс цвета фона строки.
    }
};


// Метод для выполнения поиска в таблице на основе заданного запроса.
TabulatorTable.prototype.search = function (query) {
    var self = this; // Сохранение ссылки на текущий объект.

    // Установка фильтра для таблицы.
    this.table.setFilter(function (data) {
        var keys = [];

        // Получение всех ключей данных в строке.
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        // Проход по всем ключам данных для выполнения поиска.
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (data.hasOwnProperty(key)) {
                // Проверка, содержит ли значение в строке заданный запрос (без учета регистра).
                if (String(data[key]).toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                    return true; // Возвращаем true, если найдено совпадение.
                }
            }
        }
        return false; // Возвращаем false, если совпадений не найдено.
    });
};

// Обновление текущей страницы
TabulatorTable.prototype.updateTable = function(){
    if (!this.isEditing && !this.isAdding) {
        var currentPage = this.table.getPage();
        this.table.setPage(currentPage)
    }
};

// Инициализация таблицы после полной загрузки страницы.
document.addEventListener("DOMContentLoaded", function () {
    // Создание экземпляра TabulatorTable с передачей параметров.
    var tabulator = new TabulatorTable(
        "http://localhost:3000/api/data", // URL для получения данных.
        "table-container", // Идентификатор контейнера для таблицы.
        "300px", // Высота таблицы.
        10, // Количество строк на странице.
        [10, 25, 50, 100], // Варианты количества строк на странице.
        "server" // Режим загрузки данных.
    );

    var timer = setInterval(function (){
        console.log("UPDATE")
        tabulator.updateTable()
    }, 5000);
});

