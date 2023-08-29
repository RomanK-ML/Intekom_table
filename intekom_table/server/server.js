const express = require("express");
const cors = require("cors");

class DataBaseServer {
  port = 3000;  // Порт, на котором будет запущен сервер
  app = express();  // Создание экземпляра Express приложения
  CallsDb = [];


  constructor() {

    for (let i = 1; i <= 201; i++) {
      this.CallsDb.push({
        id: i,
        date: "2023-08-" + (i < 10 ? "0" + i : i),
        phoneNumber: "+7(999) 555-" + (1000 + i),
        contact_name: "Контакт " + i,
        expectation: parseInt(i%3 + 1),
        duration: parseInt(i%12 + 1),
        type_call: (i % 2 === 0 ? "Входящий" : "Исходящий"),
        status: (i % 3 === 0 ? "Ответ" : "Нет ответа")
      });
    }

    // Подключение промежуточного ПО для обработки тела запроса
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());

    this.createRoutes();  // Создание маршрутов
    this.startServer(); // Запуск сервера
  }


  createRoutes() {
    this.app.all("/api/data", async (req, res) => {
      console.log("DATA")
      try {
        req.params
        let { page, size  } = req.query;
          // Преобразование параметров в числа
          page = parseInt(page, 10);
          size = parseInt(size, 10);
        console.log("PARAMS", req.query)
          if (isNaN(page) || page < 1) {
              page = 1;
          }

          if (isNaN(size) || size < 1) {
              size = 10;
          }
        const last_page = Math.ceil(this.CallsDb.length / size );

        const calls = this.callList(page, size);
        const dataLabels = [
          { title: "№", field: "id", headerFilter: true },
          { title: "Дата", field: "date", headerFilter: true, editor: "input", validator: "minLength:10", editorParams: { search: true } },
          { title: "Номер", field: "phoneNumber", editor: "input", headerFilter: true, validator: "minLength:16", editorParams: { search: true } },
          { title: "Контактное лицо", field: "contact_name", editor: "input", headerFilter: true, editorParams: { search: true, elementAttributes: { maxlength: "30" } } },
          { title: "Ожидание", field: "expectation", headerFilter: true, editor: "number", validator: "min:0", editorParams: { min: 0, max: 999} },
          { title: "Длительность", field: "duration", headerFilter: true, editor: "number", validator: "min:0", editorParams: { min: 0, max: 999} },
          { title: "Тип", field: "type_call", headerFilter: true, headerFilterParams: { "Входящий": "Входящий", "Исходящий": "Исходящий" }, editor: "select", editorParams: { defaultValue: "Входящий", values: { "Входящий": "Входящий", "Исходящий": "Исходящий" } } },
          { title: "Статус", field: "status", headerFilter: true, headerFilterParams: { "Ответ": "Ответ", "Нет ответа": "Нет ответа" }, editor: "select", editorParams: { defaultValue: "Ответ", values: { "Ответ": "Ответ", "Нет ответа": "Нет ответа" } } },
        ];

        res.json({ last_page: last_page, dataLabels: dataLabels, data: calls });
      } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ status: "error", message: "Internal Server Error" });
      }
    });
  }

  callList(page, size){
    const startIndex = parseInt((page -  1) * size);
    const endIndex = parseInt(startIndex + size);
    return this.CallsDb.slice(startIndex, endIndex);
  }

  // Запуск сервера
  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Сервер запущен на порту ${this.port}`);
    });
  }
}

// Создание объекта сервера и запуск сервера
const dataBaseServer = new DataBaseServer();
