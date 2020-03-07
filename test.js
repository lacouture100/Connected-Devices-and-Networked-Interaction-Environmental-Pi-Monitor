const sensor = require("node-dht-sensor").promises; // include the node-dht-sensor library
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const cron = require('node-cron');

const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const screen = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const https = require('https');
// change the hostname, macAddress, and sessionKey to your own:
let hostName = 'tigoe.io';
let macAddress = 'dc:a6:32:1f:5b:5f';
let sessionKey = 'F309E9DF-035E-49A8-BBB1-12794432421C';

let readingInterval; // interval to do readings (initialized at bottom)

let sensorReadings = {}; // object for device characteristics]

let datalog;

console.log('Ran client task');
readSensorDataDHT11();


// get sensor readings into the object called sensorReadings:
async function readSensorDataDHT11() {
   try {
      //Read the temperature and humidity from the DHT11 sensor
      sensorReadings = await sensor.read(11, 4); //Specify DHT sensor model '11', GPIO port '4'

      //Send message to server if temperature and humidity are available
      if (!isNaN(sensorReadings.temperature) && !isNaN(sensorReadings.humidity)) {
         //send message to server
         //log Sensor data
         logSensorData(sensorReadings);
         sendToServer(JSON.stringify(sensorReadings));
         clearInterval(readingInterval);
         return sensorReadings;

      };
   } catch (err) {
      console.error("Failed to read sensor data:", err);
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
      'macAddress': macAddress,
      'sessionKey': sessionKey,
      'data': data
   });

   /*
    set up the options for the request.
    the full URL in this case is:
    http://example.com:443/data
   */
   var options = {
      host: hostName,
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

   let temperature = ` temperature:${data.temperature}°C,`;
   let humidity = `humidity:${data.humidity}%`

   datalog = logTime + temperature + humidity;
   console.log(datalog);
   //Write every new log into the data.txt file with timestamp
   fs.appendFile(path.join(__dirname, '/datalog/data.txt'), `\n${datalog}`, (err) => {
      if (err) throw err;
      console.log(`The datalog was updated at ${logTime}`);
   });
}