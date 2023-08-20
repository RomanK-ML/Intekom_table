/* */
// function rq(req) {
//   return `http://192.168.1.170:9090/api/v1/query?query=${req}`;
// }
const rq = req => `http://192.168.1.170:9090/api/v1/query?query=${req}`;

// function getIpV4(ip) {
//     var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
//     return r;
// }
const getIpV4 = ip => ip.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0];

async function promReq() {
  const q = rq(`node_systemd_unit_state{name=~"(kamailio|asterisk).service"}`);

  let resp = await fetch(q);
  let content = await resp.json();

  //console.log("resp:", content);
  var tbody = document.getElementById("t_body");

  if (content.status === "success") {
    //console.log("data:", content.data);
    console.log("result:", content.data.result);
    var i = 1;
    for (item of content.data.result) {
      //console.log("item:", item);
      var instance = item.metric.instance;
      var name = item.metric.name;
      var state = item.metric.state;
      var value = item.value[1];
      //console.log(`inst: ${instance}, name: ${name}, state: ${state}, value: ${value}`);

      switch (state) {
        case "activating":
        case "deactivating":
        case "inactive":
            continue;
      }

      var row = tbody.insertRow(tbody.rows.length);
      row.innerHTML = `<tr>
                <td>${i}</td>
                <td>${name}</td>
                <td>${ getIpV4(instance)}</td>
                <td>${state}</td>
                <td>${value}</td>
            </tr>`;

      i++;
    }
  } else {
    console.log("resp: not success");
  }
}

async function reqTargets() {}

promReq();

//console.log("ip4:", getIpV4("192.168.1.173:9100"));
