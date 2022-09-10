const fs = require("fs");
var hourResets = "";

function initLogFiles() {
    // Create all folders/files if they dont exist
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
    if (!fs.existsSync("./logs/hourResets.json")) fs.writeFileSync("./logs/hourResets.json", "[]");
    // Load the reset log files
    hourResets = JSON.parse(fs.readFileSync("./logs/hourResets.json"));
}

function hourFinished(tokens) {
    // Create the timestamp
    const currentDate = new Date;
    const timeISO = currentDate.toISOString();
    // Create the message
    const message = { "timestamp": timeISO, "tokens_reset": tokens };
    // Add the message to the hourResets-file-var
    hourResets.push(message);
    // Write file
    fs.writeFileSync("./logs/hourResets.json", JSON.stringify(hourResets, null, 4));
}

module.exports = {
    init: initLogFiles,
    hourFinished: hourFinished
}

initLogFiles();
hourFinished(1);