const moment = require("moment")
Tail = require('tail').Tail;

tail = new Tail(path.join(__dirname, '/datalog/data.txt'));

tail.on("line", function(data) {
  console.log(data);
});

let logTime = moment().format();
console.log(logTime);
logTime = logTime.toString().slice(0,-6);
logTime = logTime.replace("T", "_");
console.log(logTime);
//
/* function displaySensorData() {
    // generate new datetime object:
    //let logTime = moment().format() // 2020-03-05T09:23:03-05:00
    //logTime = logTime.toString().slice(0, -6);
    //logTime = logTime.replace("T", "_");
    data = JSON.stringify(data);
    data = data.replace('{"','');
    data = data.replace(/"/g,''); 
    data = data.replace(',','\n');
    data = data.replace('}',''); 
    //datalog = logTime + data;
 
 
    let lastSent = moment().startOf('hour').fromNow(); // 24 minutes ago
 
    // set cursor to x = 0 y = 0:
    oled.setCursor(0, 30);
    oled.writeString(font, 1, data, 1, true);
 }
 
 function displayTimeSinceSent() {
 
    //let lastSent = moment().startOf('hour').fromNow(); // 24 minutes ago
    let now = new Date();
    let lastSent= (now.getMinutes()).toString()
    // set cursor to x = 0 y = 0:
    oled.setCursor(0, 0);
    oled.writeString(font, 1, `Last message sent: \n${lastSent} minutes ago`, 1, true);
 
 } */