const fs = require("fs");
var hourResets = "";

function initLogFiles() {
    // Create all folders/files if they dont exist
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
    if (!fs.existsSync("./logs/hourResets.json")) fs.writeFileSync("./logs/hourResets.json", "[]");
    if (!fs.existsSync("./logs/dailyResets.json")) fs.writeFileSync("./logs/dailyResets.json", "[]");
    // Load the reset log files
    hourResets = JSON.parse(fs.readFileSync("./logs/hourResets.json"));
    dailyResets = JSON.parse(fs.readFileSync("./logs/dailyResets.json"));
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

function dayFinished(tokens) {
    // Create the timestamp
    const currentDate = new Date;
    const timeISO = currentDate.toISOString();
    // Create the message
    const message = { "timestamp": timeISO, "tokens_reset": tokens };
    // Add the message to the dailyResets-file-var
    dailyResets.push(message);
    // Write file
    fs.writeFileSync("./logs/dailyResets.json", JSON.stringify(dailyResets, null, 4));
}

module.exports = {
    init: initLogFiles,
    hourFinished: hourFinished,
    dayFinished: dayFinished
}

initLogFiles();
hourFinished(1);