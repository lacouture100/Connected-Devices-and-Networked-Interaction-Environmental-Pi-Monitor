const moment = require("moment")
let logTime = moment().format();
console.log(logTime);
logTime = logTime.toString().slice(0,-6);
logTime = logTime.replace("T", "_");
console.log(logTime);



