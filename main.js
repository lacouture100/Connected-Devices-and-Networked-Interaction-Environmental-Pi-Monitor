const sensor = require("node-dht-sensor").promises; // include the node-dht-sensor package
const fs = require("fs"); //include the File Sync package
const path = require("path"); //include the path package
const moment = require("moment"); //include the moment package

const https = require('https'); // Include the https library to make requests
// change the hostname, macAddress, and sessionKey to your own:
let hostName = '';
let macAddress = '';
let sessionKey = '';

let sensorReadings = {}; // object for device characteristics]
let datalog; //the log of our data messages and content

////////////////////////////////////

// get sensor readings into the object called sensorReadings:
async function readSensorDataDHT11() {
   try {
      //Read the temperature and humidity from the DHT11 sensor
      sensorReadings = await sensor.read(11, 4); //Specify DHT sensor model '11', GPIO port '4'
      //Send message to server if temperature and humidity are available
      if (!isNaN(sensorReadings.temperature) && !isNaN(sensorReadings.humidity)) {
         //log Sensor data
         logSensorData(sensorReadings);
         //send message to server
         sendToServer(JSON.stringify(sensorReadings));
         //Update the values of the sensorReadings object
         return sensorReadings;
      };
   } catch (err) {
      //console log the error
      console.error("Failed to read sensor data:", err);
   }
}

//Server response callback
function getServerResponse(response) {
   //when the communication ends return the last data in the response
   response.on('end', function (data) {
      return data;
   });
}

// assemble the HTTPS request and send it:
function sendToServer(data) {
   //make the POST data a JSON object and stringify it:
   let postData = JSON.stringify({
      'macAddress': macAddress,
      'sessionKey': sessionKey,
      'data': data
   });

   ///set up the options for the request.
   let options = {
      host: hostName,
      path: '/data',
      method: 'POST',
      headers: {
         'User-Agent': 'nodejs',
         'Content-Type': 'application/json',
         'Content-Length': postData.length
      }
   };
   // Start the request
   let request = https.request(options, getServerResponse);
   // Send the request to our server
   request.write(postData);
   // Close the request
   request.end();
}

//Log sensor data into the datalog/data.txt file
function logSensorData(data) {
   //get the current time with date
   let logTime = moment().format() // Response in this format: 2020-03-05T09:23:03-05:00
   //Grab the last six digits in the logTime
   logTime = logTime.toString().slice(0, -6);
   //Replace the letter T for a _
   logTime = logTime.replace("T", "_");

   //Grab the temperature from our sensorReadings object
   let temperature = ` temperature:${data.temperature}°C,`;
   //Grab the humidity from our sensorReadings object
   let humidity = `humidity:${data.humidity}%`

   //Add the formatted data into the data file
   datalog = logTime + temperature + humidity;
   //Write every new log into the data.txt file with timestamp
   fs.appendFile(path.join(__dirname, '/datalog/data.txt'), `\n${datalog}`, (err) => {
      if (err) throw err;
   });
}
//Read, log, and send the sensor data.
readSensorDataDHT11();