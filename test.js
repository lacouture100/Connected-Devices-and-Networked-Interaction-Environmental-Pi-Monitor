const mcpadc = require('mcp-spi-adc'); // include the MCP SPI library
const sensor = require("node-dht-sensor").promises; // include the node-dht-sensor library
/* const oled = require('rpi-oled'); // include the SSD1306 OLED screen library
 var font = require('oled-font-5x7');
*/
const fs = require("fs");
const path = require("path");
const moment = require("moment");





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

let date_log = new Date();


// get sensor readings into the object called sensorReadings:

/* async function readSensorDataDHT11() {
   try {

      sensorReadings = await sensor.read(22, 4);
      tempReading = sensorReadings.temperature.toFixed(1);
      humidReading = sensorReadings.humidity.toFixed(1);
      if (!isNaN(tempReading) && !isNaN(humidReading)) {
         console.log(
            `temp:     ${tempReading}°C, `,
            `humidity: ${humidReading}%`
         );
         return sensorReadings;
         sendToServer(JSON.stringify(sensorReadings));
         clearInterval(readingInterval);
      };
   } catch (err) {
      console.error("Failed to read sensor data:", err);
   }
   return sensorReadings;
   sendToServer(JSON.stringify(sensorReadings));
   clearInterval(readingInterval);
} */
/*
 //Screen options
var opts = {
    width: 128,
    height: 64,
  };
//create screen variable with options defined
var myOled = new oled(opts);



 function displayData(data){
   myOled.turnOnDisplay();
   myOled.clearDisplay();
   myOled.setCursor(1, 1);
   myOled.writeString(font, 1, `Sent: ${data}`, 1, true);
}  */


function getServerResponse(response) {
   // when the final chunk comes in, print it out:
   response.on('end', function (data) {
      console.log(data);
      console.log("Success! Message sent.")


   });
}

// open two ADC channels:
let tempSensor = mcpadc.open(0, sampleRate, addNewChannel);

function addNewChannel(error) {
   if (error) throw error;
}
// callback function for tempSensor.read():
function getTemperature(error, reading) {
   if (error) throw error;
   // range is 0-1. Convert to Celsius (see TMP36 data sheet for details)
   let temperature = (reading.value * supplyVoltage - 0.5) * 100;
   // convert to a floating point number of 2 decimal point precision:
   device.temperature = Number(temperature.toFixed(2));
}



// get sensor readings into the object called device:
function getReadings() {
   // get readings:
   tempSensor.read(getTemperature);
   // if they're both numbers:
   if (!isNaN(device.temperature) ) {
      // print them and send to server:
      console.log(device);
      logSensorData(device);

      //sendToServer(JSON.stringify(device));
      // stop reading:
      clearInterval(readingInterval);
   }
}

// assemble the HTTPS request and send it:
function sendToServer(dataToSend) {
   // make the POST data a JSON object and stringify it:
   var postData = JSON.stringify({
      'macAddress': macAddress,
      'sessionKey': sessionKey,
      'data': dataToSend
   });

   /*
    set up the options for the request.
    the full URL in this case is:
    http://example.com:443/data
   */
   var options = {
      host: hostName,
      port: 443,
      path: '/data',
      method: 'POST',
      headers: {
         'User-Agent': 'nodejs',
         'Content-Type': 'application/json',
         'Content-Length': postData.length
      }
   };

   var request = https.request(options, getServerResponse);	// start it
   request.write(postData);			// send the data
   request.end();			            // end it

}

function logSensorData(data){
   let logTime = moment().format() // 2020-03-05T09:23:03-05:00
   logTime = logTime.toString().slice(0,-6);
   logTime = logTime.replace("T", "_");
   console.log(logTime)

   data = JSON.stringify(data);
   data = data.replace('{"temperature":', 'T');
   data = data.replace('}', '-');

   data = data.join(logTime,data);
   fs.writeFileSync(path.join(__dirname, '/datalog/data.txt'), data);

}
readingInterval = setInterval(getReadings, 1000);
