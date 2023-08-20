const express = require("express");
const cors = require("cors");

class DataBaseServer {
  port = 3000;  // Порт, на котором будет запущен сервер
  app = express();  // Создание экземпляра Express приложения
  CallsDb = [];


  constructor() {

    for (var i = 1; i <= 201; i++) {
      this.CallsDb.push({
        id: i,
        date: "2023-08-" + (i < 10 ? "0" + i : i),
        phoneNumber: "+7(999) 555-" + (1000 + i),
        contact_name: "Контакт " + i,
        expectation: "Ожидание " + i,
        duration: (i % 2 === 0 ? "3 минуты" : "5 минут"),
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
        console.log("PARAMS", req.query)
        if (!page) {
          page = 1;
        }

        if (!size ) {
          size  = 10;
        }
        const last_page = Math.ceil(this.CallsDb.length / size );

        const calls = this.callList(page, size);
        const dataLabels = [
          { title: "ID", field: "id", editable: true, editType: "input", editorParams:{search:true, selectContents:true, elementAttributes:{maxlength:"10"}} },
          { title: "Дата", field: "date" },
          { title: "Номер", field: "phoneNumber" },
          { title: "Контактное лицо", field: "contact_name" },
          { title: "Ожидание", field: "expectation" },
          { title: "Длительность", field: "gender" },
          { title: "Тип", field: "type_call" },
          { title: "Статус", field: "status" },
        ];

        res.json({ last_page: last_page, dataLabels: dataLabels, currentPage: page, data: calls });
      } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ status: "error", message: "Internal Server Error" });
      }
    });
  }

  callList(page, size){
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
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
