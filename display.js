const moment = require("moment");
const path = require("path");
const fs = require("fs");
const Tail = require('tail').Tail;

const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const screen = require('oled-i2c-bus');
const font = require('oled-font-5x7');


var opts = {
    width: 128, // screen width and height
    height: 64,
    address: 0x3C // I2C address:check your particular model
 };
 var oled = new screen(i2cBus, opts);

fs.readFile(path.join(__dirname, '/datalog/data.txt'), (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    //console.log(data)
    //console.log(data)
    //console.log(`${tempData}C\n${humidData}%`)
    displayTimeSinceSent();
    displaySensorData(data);

})
function displaySensorData(data) {
    // generate new datetime object:
    //let logTime = moment().format() // 2020-03-05T09:23:03-05:00
    //logTime = logTime.toString().slice(0, -6);
    //logTime = logTime.replace("T", "_");
    data = data.toString().slice(-60);
    console.log(data)
    /*   data = data.replace('{"','');
      data = data.replace(/"/g,''); 
      data = data.replace(',','\n');
      data = data.replace('}',''); 
     data = data.replace(/"/g, '');*/

    data = data.substr(data.indexOf('t'), data.indexOf('}'));
    console.log(data);
    data = data.replace(',', '\n'); 
    console.log(data);
    // set cursor to x = 0 y = 0:
    oled.setCursor(0, 30);
    oled.writeString(font, 1, data, 1, true);
    console.log(data);
}

function displayTimeSinceSent() {

    //let lastSent = moment().startOf('hour').fromNow(); // 24 minutes ago
    let now = new Date();
    let lastSent = (now.getMinutes()).toString()
    // set cursor to x = 0 y = 0:
    oled.setCursor(0, 0);
    oled.writeString(font, 1, `Last message sent: \n${lastSent} minutes ago`, 1, true);
    
}