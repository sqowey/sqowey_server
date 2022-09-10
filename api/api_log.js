const fs = require("fs");

function initLogFile() {
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
    if (!fs.existsSync("./logs/api.md")) {
        fs.writeFileSync("./logs/api.md", "Date | Time | Statuscode | Endpoint | Method | Data\n-|-|-|-|-|-")
    }
}

function writeLog(method, endpoint, statuscode, log_data) {
    // Convert json
    if (typeof log_data == "object") {
        log_data = JSON.stringify(log_data);
    }
    // Create string variable
    var writeString = "\n";
    // Date
    const date = new Date;
    writeString += date.getDate() + ".";
    writeString += date.getMonth() + 1 + ".";
    writeString += date.getFullYear() + " | ";
    writeString += date.getHours() + ":";
    writeString += date.getMinutes() + ":";
    writeString += date.getSeconds() + " | ";
    // Method
    writeString += method + " | ";
    // Method
    writeString += endpoint + " | ";
    // Add statuscode
    writeString += statuscode + " | ";
    // Add logdata
    writeString += log_data;
    // Write to file
    fs.appendFile("./log.md", writeString, (err) => {});
}

module.exports = {
    writeLog: writeLog,
    initLogFile: initLogFile
}