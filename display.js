const moment = require("moment");
const path = require("path");
const fs = require("fs");
const Tail = require('tail').Tail;

/* const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const screen = require('oled-i2c-bus');
const font = require('oled-font-5x7');
 */
try {

    fs.readFile(path.join(__dirname, '/datalog/data.txt'), (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        //console.log(data)

        /*   let tempData = data.substring(data.indexOf('t'), data.indexOf('\n'));
          let humidData = data.substring(data.indexOf('\n'), -1); */

        console.log(data)
        //console.log(`${tempData}C\n${humidData}%`)
        displayTimeSinceSent();
        displaySensorData(data);

    })
}



    /* let logTime = moment().format();
    console.log(logTime);
    logTime = logTime.toString().slice(0,-6);
    logTime = logTime.replace("T", "_");
    console.log(logTime); */
    //
    function displaySensorData(data) {
        // generate new datetime object:
        //let logTime = moment().format() // 2020-03-05T09:23:03-05:00
        //logTime = logTime.toString().slice(0, -6);
        //logTime = logTime.replace("T", "_");
        data = data.toString().substr(-60, 60);
        /*   data = data.replace('{"','');
          data = data.replace(/"/g,''); 
          data = data.replace(',','\n');
          data = data.replace('}',''); */
        data = data.replace(/"/g, '');

        data = data.substring(data.indexOf('t'), data.indexOf('}'));
        data = data.replace(',', '\n');
        // set cursor to x = 0 y = 0:
        oled.setCursor(0, 30);
        oled.writeString(font, 1, data, 1, true);
    }

    function displayTimeSinceSent() {

        //let lastSent = moment().startOf('hour').fromNow(); // 24 minutes ago
        let now = new Date();
        let lastSent = (now.getMinutes()).toString()
        // set cursor to x = 0 y = 0:
        oled.setCursor(0, 0);
        oled.writeString(font, 1, `Last message sent: \n${lastSent} minutes ago`, 1, true);

    }