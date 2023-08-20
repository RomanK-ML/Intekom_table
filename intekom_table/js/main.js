/**/

async function main() {

  //========= TABS (Заглушка) =============
  const tabs = document.getElementsByClassName("tab");
  //console.log("tabs:", tabs);
  for (let item of tabs) {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      //console.log("item:", item);

      let id = e.target.getAttribute("href");
      id = id.replace("#", "");
      //console.log("id:", id);

      // сами менюшки (табы)
      // document.querySelectorAll('tabs').forEach(
      //     (child) => { console.log("1"); child.removeClass('active');}
      // );
      for (let tab of tabs) {
        tab.classList.remove("active");
      }

      // Вкладки с контекстом
      const tabs_body = document.getElementsByClassName("tabs-block");
      for (let bd of tabs_body) {
        bd.classList.remove("active");
      }
      // document.querySelectorAll('tabs-body').forEach(
      //     (child) => { console.log("2"); child.removeClass('active') }
      // );

      item.classList.add("active");
      document.getElementById(id).classList.add("active");
    });
  } //end of for

  // Начальное первое значение. Эмулируем нажатие.
  const tab = document.getElementsByClassName("tab")[2];
  //console.log("tab2:", tab);
  tab.click();
}

function users_import() {
  console.log("users_import()");
}

// Popup for import
const impCsv = new PopUp({
  id: "import-users-csv",
  width: "500px"
});

main();