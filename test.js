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

// get sensor readings into the object called sensorReadings:
async function readSensorDataDHT11() {
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
            `temperature:${tempReading}°C, `,
            `humidity:   ${humidReading}%`
         );
         //send message to server
         //log Sensor data
         logSensorData(sensorReadings);
         //sendToServer(JSON.stringify(sensorReadings));
         clearInterval(readingInterval);
         return sensorReadings;

      };
   } catch (err) {
      console.error("Failed to read sensor data:", err);
   }

}



//Read the temperature and humidity from the DHT11 sensor
/* function readSensorDataDHT11() {
   {
      //grab the humidity reading and limit decimals to 1
      try {
         //Send message tot server if temperature and humidity are available
         let tempReading = 2.0;
         let humidReading = 2.0;
         if (!isNaN(tempReading) && !isNaN(humidReading)) {

            sensorReadings.temperature = tempReading.toFixed(1);
            sensorReadings.humidity = humidReading.toFixed(1);
            console.log(
               `temperature: ${sensorReadings.temperature}°C, `,
               `humidity: ${sensorReadings.humidity}%`
            );
            //log Sensor data
            logSensorData(sensorReadings);
            //displaySensorData(sensorReadings);
            //send message to server
            sendToServer(JSON.stringify(sensorReadings));


            clearInterval(readingInterval);
            return sensorReadings;
         };
      } catch (err) {
         console.error("Failed to read sensor data:", err);
      }

   }
} */

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
   console.log(data.temperature);
   console.log(data.humidity)

   data = JSON.stringify(data);

   datalog = logTime + data;
   //Write every new log into the data.txt file with timestamp
   fs.appendFile(path.join(__dirname, '/datalog/data.txt'), `\n${datalog}`, (err) => {
      if (err) throw err;
      console.log(`The datalog was updated at ${logTime}`);
   });
}

readSensorDataDHT11();
// update once per second:
//readingInterval = setInterval(readSensorDataDHT11, 1000);
