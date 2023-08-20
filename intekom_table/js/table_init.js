let jsonData = {
    "data": [
        { id: 1, date: "2023-08-01", phoneNumber: "555-1111", contact_name: "Иван", expectation: "", duration: "3 минуты", type_call: "Входящий", status: "Ответ",  },
        { id: 1, date: "2023-08-11", phoneNumber: "555-1451", contact_name: "Петр", expectation: "", duration: "5 минут", type_call: "Исходящий", status: "Нет ответа",  },
    ],
    "dataLabels":[
        { title: "ID", field: "id", editable: true, editType: "input", editorParams:{search:true, selectContents:true, elementAttributes:{maxlength:"10"}} },
        { title: "Дата", field: "date" },
        { title: "Номер", field: "phoneNumber" },
        { title: "Контактное лицо", field: "contact_name" },
        { title: "Ожидание", field: "expectation" },
        { title: "Длительность", field: "gender" },
        { title: "Тип", field: "type_call" },
        { title: "Статус", field: "status" },
    ],
    "maxPages": 10
}


class TabulatorTable{
    url = "http://localhost:3000"
    calls = []
    renderCalls = [];
    dataLabels = []
    callsForPage = 10;
    table
    currentPage = 2;
    maxPages = 1;
    isEdit = true;
    editRowId = 5;

    // Опции для таблицы
    tableOptions = {}


    constructor(url, callsPerPage, currentPage){
        if (url){
            this.url = url
        }
        if (callsPerPage){
            this.callsPerPage = callsPerPage
        }
        if (currentPage){
            this.currentPage = currentPage
        }

        // this.maxPages = callsData.maxPages
        // this.calls = callsData.data

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
                        "all":"Все"
                    },
                }
            },
            locale:"ru-ru",
            ajaxURL: this.url + "/api/data",
            paginationSize : 10 ,
            paginationSizeSelector : [ 10 , 25 , 50 , 100 ],
            ajaxResponse:function(url, params, response){
                self.calls = response.data
                self.renderCalls = self.calls
                self.maxPages = response.last_page
                self.dataLabels = response.dataLabels

                console.log("CALLS")
                console.log(self.calls)



                return response; //return the tableData property of a response json object
            },
            ajaxContentType:"json",
            reactiveData:true,
            index: "id",
            // data: this.renderCalls,
            layout: "fitDataStretch",
            // columns: this.dataLabels,
            columns: [
                {title: "№", field: "id", visible: true},
                {title: "Дата", field: "date", editor: "input"},
                {title: "Номер", field: "phoneNumber", editor: "input"},
                {title: "Контактное лицо", field: "contact_name", editor: "input"},
                {title: "Ожидание", field: "expectation"},
                {title: "Длительность", field: "duration"},
                {title: "Тип", field: "type_call", editor: "input"},
                {title: "Статус", field: "status", editor: "input"},
                {
                    title: "Действия", width: "45px", hozAlign: "center", formatter: function () {
                        return "<button>Редактировать</button><button>Удалить</button>"

                    }, cellClick: function (e, cell) {
                        alert("Data for: " + cell.getRow().getData().contact_name)
                    }
                },
            ],
            cellEdited: function (cell) {
                if (cell.column.definition.editor) {
                    cell.edit();
                }
            },
            // autoColumns: true // Создать столбцы автоматически на основе данных
        };




        // Создание таблицы внутри контейнера
        this.table = new Tabulator("#table-container", this.tableOptions);




        // this.initData(this.url, {page: this.currentPage, callsPerPage: this.callsPerPage})
        //     .then(callsData => {
        //         this.maxPages = callsData.maxPages
        //         this.calls = callsData.data
        //         this.renderCalls = this.calls
        //         console.log("LOG")
        //         console.log(this.calls)
        //         this.tableOptions = {
        //             pagination: "remote",
        //             ajaxURL: "http://localhost:3000/api/data",
        //             paginationSize : 10 ,
        //             paginationSizeSelector : [ 10 , 25 , 50 , 100 ],
        //             ajaxConfig: {
        //                 method: "POST", //set request type to Position
        //                 headers: {
        //                     "Content-type": 'application/json; charset=utf-8', //set specific content type
        //                 },
        //             },
        //             ajaxContentType:"json",
        //             reactiveData:true,
        //             // data: this.renderCalls,
        //             layout: "fitDataStretch",
        //             columns: [
        //                 { title: "№", field: "id" },
        //                 { title: "Дата", field: "date", editor: "input"  },
        //                 { title: "Номер", field: "phoneNumber", editor: "input" },
        //                 { title: "Контактное лицо", field: "contact_name", editor: "input"  },
        //                 { title: "Ожидание", field: "expectation" },
        //                 { title: "Длительность", field: "duration" },
        //                 { title: "Тип", field: "type_call", editor: "input"  },
        //                 { title: "Статус", field: "status", editor: "input"  },
        //             ],
        //             cellEdited: function(cell) {
        //                 if (cell.column.definition.editor) {
        //                     cell.edit();
        //                 }
        //             },
        //             // rowClick: "edit", // Разрешить редактирование по клику на строку
        //             // autoColumns: true // Создать столбцы автоматически на основе данных
        //         };
        //
        //
        //
        //
        //         // Создание таблицы внутри контейнера
        //         this.table = new Tabulator("#table-container", this.tableOptions);
        //     })
    }

    async initData(url, data) {
        const response = await fetch(url + "/api/LayoutDataCallsPage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Ошибка при получении данных");
        }
    }

    search(query) {
        console.log("CALLS-1")
        console.log(self.calls)

        this.table.setData(self.calls)
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

    nextPage() {

    }

    prevPage() {

    }

    addData(data) {

    }

    renderData() {
        // Обновление данных в таблице
        this.table.setData(this.renderCalls)
    }

}

document.addEventListener("DOMContentLoaded",function (){
    const tabulator = new TabulatorTable("http://localhost:3000",10,2)

    const searchInput = document.getElementById("search");

    searchInput.addEventListener("input", function (event) {
        const searchQuery = event.target.value;
        if (searchQuery.length >= 3){
            tabulator.search(searchQuery); // Вызываем метод поиска таблицы с переданным запросом
        }
    });
});



