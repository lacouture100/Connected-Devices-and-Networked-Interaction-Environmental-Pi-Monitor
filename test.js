const mcpadc = require('mcp-spi-adc'); // include the MCP SPI library
const sensor = require("node-dht-sensor").promises; // include the node-dht-sensor library
/* const oled = require('rpi-oled'); // include the SSD1306 OLED screen library
 var font = require('oled-font-5x7');
*/
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const screen = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const sampleRate = {
   speedHz: 20000
}; // ADC sample rate
let device = {}; // object for device characteristics
let supplyVoltage = 3.3; // analog reference voltage
let resolution = 1.0; // A-to-D resolution
let readingInterval; // interval to do readings (initialized at bottom)

const https = require('https');
// change the hostname, macAddress, and sessionKey to your own:
let hostName = '';
let macAddress = '';
let sessionKey = '';

let tempReading = 0.0;
let humidReading = 0.0;

let sensorReadings = {}; // object for device characteristics]

let datalog;


var opts = {
   width: 128, // screen width and height
   height: 64,
   address: 0x3C // I2C address:check your particular model
};
var oled = new screen(i2cBus, opts);

// get sensor readings into the object called sensorReadings:
/* async function readSensorDataDHT11() {
   try {
      //Specify DHT sensor model '11', GPIO port '4'
      sensorReadings = await sensor.read(11, 4);
      //grab the temperature reading and limit decimals to 1
      tempReading = sensorReadings.temperature.toFixed(1);

      //grab the humidity reading and limit decimals to 1
      humidReading = sensorReadings.humidity.toFixed(1);
      //Send message tot server if temperature and humidity are available
      if (!isNaN(tempReading) && !isNaN(humidReading)) {
         console.log(
            `temp:     ${tempReading}°C, `,
            `humidity: ${humidReading}%`
         );
         return sensorReadings;
         //send message to server
         sendToServer(JSON.stringify(sensorReadings));
         clearInterval(readingInterval);
      };
   } catch (err) {
      console.error("Failed to read sensor data:", err);
   }

}  */

oled.clearDisplay();


//Read the temperature and humidity from the DHT11 sensor
function readSensorDataDHT11() {
   {
      //grab the humidity reading and limit decimals to 1
      try {
         //Send message tot server if temperature and humidity are available
         let tempReading = 1.0;
         let humidReading = 1.0;
         if (!isNaN(tempReading) && !isNaN(humidReading)) {

            sensorReadings.temperature = tempReading.toFixed(1);
            sensorReadings.humidity = humidReading.toFixed(1);
            console.log(
               `temperature: ${sensorReadings.temperature}°C, `,
               `humidity: ${sensorReadings.humidity}%`
            );
            //log Sensor data
            logSensorData(sensorReadings);
            displaySensorData(sensorReadings);
            //send message to server
            sendToServer(JSON.stringify(sensorReadings));
            

            clearInterval(readingInterval);
            return sensorReadings;
         };
      } catch (err) {
         console.error("Failed to read sensor data:", err);
      }

   }
}

//Server response callback
function getServerResponse(response) {
   // when the final chunk comes in, print it out:
   response.on('end', function (data) {
      return data;
   });
}

// assemble the HTTPS request and send it:
function sendToServer(data) {
   // make the POST data a JSON object and stringify it:
   var postData = JSON.stringify({
      'macAddress': 'dc:a6:32:1f:5b:5f',
      'sessionKey': 'F309E9DF-035E-49A8-BBB1-12794432421C',
      'data': data
   });

   /*
    set up the options for the request.
    the full URL in this case is:
    http://example.com:443/data
   */
   var options = {
      host: 'tigoe.io',
      path: '/data',
      method: 'POST',
      headers: {
         'User-Agent': 'nodejs',
         'Content-Type': 'application/json',
         'Content-Length': postData.length
      }
   };

   var request = https.request(options, getServerResponse); // start it
   request.write(postData); // send the data
   request.end(); // end it
   console.log("Success! Message sent.")

}



//Log sensor data into the datalog/data.txt file
function logSensorData(data) {
   let logTime = moment().format() // 2020-03-05T09:23:03-05:00
   logTime = logTime.toString().slice(0, -6);
   logTime = logTime.replace("T", "_");

   data = JSON.stringify(data);

   datalog = logTime + data;
   //Write every new log into the data.txt file with timestamp
   fs.appendFile(path.join(__dirname, '/datalog/data.txt'), `\n${datalog}`, (err) => {
      if (err) throw err;
      console.log(`The datalog was updated at ${logTime}`);
   });
}

/* function displaySensorData(data) {

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

// update once per second:
readingInterval = setInterval(readSensorDataDHT11, 1000);
let displayDataInterval = setInterval(displayTimeSinceSent, 100);