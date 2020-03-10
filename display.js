const path = require("path"); //include the path package
const fs = require("fs"); //include the File Sync package
const moment = require("moment"); //include the moment package

const i2c = require('i2c-bus'); //include the i2c-bus package for the OLED screen
const i2cBus = i2c.openSync(1); //
const screen = require('oled-i2c-bus'); //include the OLED screen package
const font = require('oled-font-5x7'); // include the font for the screen

//Options for the OLED screen.
let opts = {
    width: 128, // screen width and height
    height: 64,
    address: 0x3C // I2C address:check your particular model
};
//assign the screen to the oled variable
let oled = new screen(i2cBus, opts);

//Display the sensor data and timelog on screen
async function displaySensorData() {
    //get the current time with date
    let logTime = moment().format() // Response in this format: 2020-03-05T09:23:03-05:00
    //look for the data file to log the data
    fs.readFile(path.join(__dirname, '/datalog/data.txt'), (err, data) => {
        if (err) {
            //console log the error
            console.error(err)
            return
        }
    });
    //if you don't wait for the screen to clean the message will get garbled
    await oled.clearDisplay();
    //Grab the last line in the datalog
    data = data.toString().slice(-30);
    //Split the last entry into temperature and humidity
    data = data.replace(',', '\n');
    //Clean the temp and humidity from their quotations marks
    data = data.replace(/"/g, '');

    // set cursor in screen to x = 0 y = 0:
    oled.setCursor(0, 0);
    // write the cleaned data unto the screen
    oled.writeString(font, 1, data, 1, true);
    //display how much time ahs passed since the last message was sent.
    displayTimeSinceSent()
}

function displayTimeSinceSent() {
    //use the Date from Node
    let now = new Date();
    //The time that has passed in minutes since the completion of an hour
    let lastSent = (now.getMinutes()).toString();
    // set cursor to x = 0 y = 30:
    oled.setCursor(0, 30);
    // write the time since the last message was sent
    oled.writeString(font, 1, `Last message sent: \n${lastSent} minutes ago`, 1, true);
}
//Display the last data log and time sent in the OLED screen
displaySensorData();