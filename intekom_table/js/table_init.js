class TabulatorTable {
    url = "http://localhost:3000/api/data";
    dataLabels = "server";
    callsPerPage = 10;
    callsSizeSelector= [ 10 , 25 , 50 , 100 ];
    table;
    isEdit = true;
    isAdd = false;
    editRowId = 2;
    containerId;

    // Опции для таблицы
    tableOptions = {}


    constructor(url, containerId, callsPerPage, callsSizeSelector, columnsConfig){
        if (url){
            this.url = url
        }
        if (containerId){
            this.containerId = containerId
        }
        if (callsPerPage){
            this.callsPerPage = callsPerPage
        }
        if (callsSizeSelector){
            this.callsSizeSelector = callsSizeSelector
        }
        if (columnsConfig || columnsConfig !== "server"){
            this.dataLabels = columnsConfig
        }
        if (this.dataLabels !== "server"){
            
        }


        this.setupTable()
        this.initEvents()

    }

    setupTable(){
        const self = this;

        const editCheck = function (cell) {
            if (self.isAdd) {
                return !!cell.getRow().getElement().getAttribute("data-add-row");
            } else if (self.isEdit === true) {
                return cell.getRow().getData().id === self.editRowId;
            }

            return false
        };


        this.tableOptions = {
            placeholder:"Нет данных",
            pagination: "remote",
            langs:{
                "ru-ru":{
                    "pagination":{
                        "first":"В начало",
                        "last":"В конец",
                        "prev":"Предыдущая",
                        "next":"Следующая",
                        "all":"Все",
                        "page_size":"Показывать по"
                    },
                }
            },
            locale:"ru-ru",
            ajaxURL: this.url,
            paginationSize : this.callsPerPage ,
            paginationSizeSelector : this.callsSizeSelector,
            ajaxResponse:function(url, params, response){
                if(self.table instanceof Tabulator){
                    self.table.clearFilter();
                    const inputContainer = document.getElementById(self.containerId + "-search")
                    if (inputContainer){
                        inputContainer.value = ""
                    }
                }

                return response;
            },
            pageLoaded:function(){
                if(self.table instanceof Tabulator){
                    self.table.redraw()
                }
            },
            ajaxContentType:"json",
            virtualDom: true,
            virtualDomBuffer: 200,
            height: "400px",
            reactiveData:true,
            history:true,
            index: "id",
            layout: "fitDataFill",
            headerFilterPlaceholder: "Поиск...",
            columnMinWidth : 80 ,
            // columns: this.dataLabels,
            columns: [
                { title: "№", field: "id", hozAlign: "center", headerHozAlign: "center", headerFilter: true },
                { title: "Дата", field: "date", hozAlign: "center", headerHozAlign: "center", headerFilter: true, editor: "input", editable: editCheck, validator: "minLength:10", editorParams: { search: true, mask: "9999-99-99", maskAutoFill:true, } },
                { title: "Номер", field: "phoneNumber", hozAlign: "center", headerHozAlign: "center", editor: "input", headerFilter: true, editable: editCheck, validator: "minLength:16", editorParams: { search: true, mask: "+9(999) 999-9999", maskAutoFill:true, } },
                { title: "Контактное лицо", field: "contact_name", hozAlign: "center", headerHozAlign: "center", editor: "input", headerFilter: true, editable: editCheck, editorParams: { search: true, elementAttributes: { maxlength: "30" } } },
                { title: "Ожидание", field: "expectation", hozAlign: "center", headerHozAlign: "center", headerFilter: true, editable: editCheck, editor: "number", validator: "min:0", editorParams: { search: true, min: 0, max: 999} },
                { title: "Длительность", field: "duration", hozAlign: "center", headerHozAlign: "center", headerFilter: true, editable: editCheck, editor: "number", validator: "min:0", editorParams: { search: true, min: 0, max: 999} },
                { title: "Тип", field: "type_call", hozAlign: "center", headerHozAlign: "center", headerFilter: true, headerFilterParams: { "Входящий": "Входящий", "Исходящий": "Исходящий" }, editable: editCheck, editor: "select", editorParams: { defaultValue: "Входящий", values: ["Входящий", "Исходящий"] } },
                { title: "Статус", field: "status", hozAlign: "center", headerHozAlign: "center", headerFilter: true, headerFilterParams: { "Ответ": "Ответ", "Нет ответа": "Нет ответа" }, editable: editCheck, editor: "select", editorParams: { defaultValue: "Ответ", values: { "Ответ": "Ответ", "Нет ответа": "Нет ответа" } } },
                {
                    title: "Действия", minWidth: "200px",maxWidth: "500px", hozAlign: "center", headerHozAlign: "center", formatter: function () {
                        return "<button data-action='accept' hidden>Принять</button><button data-action='cancel' hidden>Отменить</button><button data-action='edit'>Редактировать</button><button data-action='delete'>Удалить</button>"

                    }, cellClick: function (e, cell) {

                        const action = e.target.getAttribute("data-action");
                        const rowElement = cell.getRow().getElement();

                        if (action  === "edit") {
                            self.table.getRows().forEach(row => {
                                const buttons = row.getElement().querySelectorAll('[data-action]');
                                buttons.forEach(button => {
                                    button.disabled = true;
                                });

                                row.getElement().style.backgroundColor = "#303030cc";
                            });


                            const actionButtons = rowElement.querySelectorAll('[data-action]');
                            actionButtons.forEach(button => {
                                button.disabled = false
                                const buttonAction = button.getAttribute('data-action');
                                button.hidden = !(buttonAction === "accept" || buttonAction === "cancel");
                            })
                            self.table.clearHistory()
                            self.isEdit = true;
                            self.disablePaginationClicks()
                            self.editRowId = cell.getRow().getData().id;


                            cell.getRow().getElement().style.backgroundColor = "#b6bcce";


                        } else if (action === "accept"){
                            if (self.isAdd){
                                cell.getRow().getElement().removeAttribute("data-add-row")

                                //Отправка изменений на сервер
                            }

                            const actionButtons = rowElement.querySelectorAll('[data-action]');
                            actionButtons.forEach(button => {
                                const buttonAction = button.getAttribute('data-action');
                                button.hidden = (buttonAction === "accept" || buttonAction === "cancel");
                            })

                            self.enablePaginationClicks();

                            self.table.getRows().forEach(row => {
                                const buttons = row.getElement().querySelectorAll('[data-action]');
                                buttons.forEach(button => {
                                    button.disabled = false;
                                });

                                row.getElement().style.backgroundColor = "";
                            });

                            self.isEdit = false;
                            self.isAdd = false;

                            //Отправка изменений на сервер

                        } else if (action === "cancel"){
                            if (self.isAdd){
                                cell.getRow().delete();
                            }  else {

                                const actionButtons = rowElement.querySelectorAll('[data-action]');
                                actionButtons.forEach(button => {
                                    const buttonAction = button.getAttribute('data-action');
                                    button.hidden = (buttonAction === "accept" || buttonAction === "cancel");
                                })

                                let isUndo = true;
                                while(isUndo){
                                    isUndo = self.table.undo()
                                }



                            }

                            self.enablePaginationClicks();

                            self.table.getRows().forEach(row => {
                                const buttons = row.getElement().querySelectorAll('[data-action]');
                                buttons.forEach(button => {
                                    button.disabled = false;
                                });

                                row.getElement().style.backgroundColor = "";
                            });


                            self.isEdit = false;
                            self.isAdd = false;
                        } else if (action === "delete"){
                            self.isEdit = false;

                            //Отправка изменений на сервер
                            cell.getRow().delete();


                        }
                    }
                },
            ],
        };

        this.addHeaderPanel();

        const dataTableContainer = document.createElement("div");
        dataTableContainer.className = `${this.containerId}-data-table`;
        document.getElementById(this.containerId).appendChild(dataTableContainer);

        // Создание таблицы внутри контейнера
        this.table = new Tabulator(dataTableContainer, this.tableOptions);
    }


    addHeaderPanel(){
        const headerPanel = document.createElement("div");
        headerPanel.style.maxWidth = "100%";
        headerPanel.innerHTML = `
            <input placeholder="Поиск" type="text" id="` + this.containerId + "-search" + `" required minlength="4" size="10" />
            <button type="button" id="` + this.containerId + "-addUser" + `">Добавить пользователя</button>
        `;
        document.getElementById(this.containerId).appendChild(headerPanel);
    }

    initEvents() {
        const searchInput = document.getElementById(`${this.containerId}-search`);
        const addUserInput = document.getElementById(`${this.containerId}-addUser`);

        searchInput.addEventListener("input", (event) => {
            const searchQuery = event.target.value;
            if (searchQuery.length > 0) {
                this.search(searchQuery);
            }
        });

        addUserInput.addEventListener("click", (event) => {
            this.isAdd = true;
            this.table.addRow({}, true).then((row) => {
                this.disablePaginationClicks();

                row.getElement().setAttribute("data-add-row", "true");

                const rowElement = row.getElement();
                const actionButtons = rowElement.querySelectorAll('[data-action]');
                actionButtons.forEach(button => {
                    const buttonAction = button.getAttribute('data-action');
                    button.hidden = !(buttonAction === "accept" || buttonAction === "cancel");

                    this.table.getRows().forEach((row)  => {
                        row.getElement().style.backgroundColor = "#303030cc";
                    })

                    row.getElement().style.backgroundColor = "#b6bcce";
                })

            })
        })

    }

    disablePaginationClicks() {
        const tabulatorPageElements = document.getElementById(this.containerId).querySelectorAll(".tabulator-page, .tabulator-page-size")
        document.getElementById(this.containerId + "-addUser").disabled = true

        tabulatorPageElements.forEach(element => {
            element.disabled = true
        });

    }

    enablePaginationClicks() {
        const tabulatorPageElements = document.getElementById(this.containerId).querySelectorAll(".tabulator-page, .tabulator-page-size")
        document.getElementById(this.containerId + "-addUser").disabled = false

        tabulatorPageElements.forEach(element => {
            element.disabled = false
            if (element.getAttribute("data-page") === "first" || element.getAttribute("data-page") === "prev"){
                const currentPage = this.table.getPage()
                if (currentPage === 1){
                    element.disabled = true
                }

            } else if (element.getAttribute("data-page") === "next" || element.getAttribute("data-page") === "last"){
                const currentPage = this.table.getPage()
                const maxPage = this.table.getPageMax()
                if (currentPage === maxPage){
                    element.disabled = true
                }
            }
        });
    }

    search(query) {
        this.table.setFilter(function(data){
            // Проходимся по всем значениям в строке
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    // Если хотя бы одно значение содержит искомую подстроку, возвращаем true
                    if (String(data[key]).toLowerCase().includes(query.toLowerCase())) {
                        return true;
                    }
                }
            }
            // Если ни одно значение не содержит искомую подстроку, возвращаем false
            return false;
        });
    }

}

document.addEventListener("DOMContentLoaded",function (){
    const tabulator = new TabulatorTable("http://localhost:3000/api/data", "table-container", 10, [ 10 , 25 , 50 , 100 ], "server" )
});



