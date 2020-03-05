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


function readSensorDataDHT11() {
   {

      //grab the humidity reading and limit decimals to 1
     
      //Send message tot server if temperature and humidity are available
      if (!isNaN(tempReading) && !isNaN(humidReading)) {

         sensorReadings.temperature = tempReading;
         sensorReadings.humidity = humidReading;
         console.log(
            `temperature: ${tempReading}°C, `,
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

} 


function getServerResponse(response) {
   // when the final chunk comes in, print it out:
   response.on('end', function (data) {
      console.log(data);
      console.log("Success! Message sent.")
   });
}

// open two ADC channels:
let tempSensor = mcpadc.open(0, sampleRate, addNewChannel);


// assemble the HTTPS request and send it:
function sendToServer(dataToSend) {
   // make the POST data a JSON object and stringify it:
   var postData = JSON.stringify({
      'macAddress': /*'dc:a6:32:1f:5b:5f',*/ 'AA:BB:CC:DD:EE:FF',
      'sessionKey': '12345678',
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
   console.log (postData);
   request.end();			            // end it

}

function logSensorData(data){
   let logTime = moment().format() // 2020-03-05T09:23:03-05:00
   logTime = logTime.toString().slice(0,-6);
   logTime = logTime.replace("T", "_");

   data = JSON.stringify(data);
   //data = data.replace('{"temperature":', 'T');
   //data = data.replace('}', '-');

   let datalog = logTime + data;
   fs.writeFileSync(path.join(__dirname, '/datalog/data.txt'), datalog);

}
readingInterval = setInterval(getReadings, 1000);
