// Get modules
const fs = require("fs");

// The function to move the logs
function moveLogs() {

    // Create the date
    var current_date = new Date;
    var hourly_file_new_name = 'resetInfo-Hourly-' + current_date.getFullYear() + "-" + current_date.getMonth() + "-" + current_date.getDate() + ".json";
    var daily_file_new_name = 'resetInfo-Daily-' + current_date.getFullYear() + "-" + current_date.getMonth() + "-" + current_date.getDate() + ".json";

    // Move the daily log file
    fs.rename('./logs/dailyResets.json', './logs/old/' + daily_file_new_name, (err) => {
        if (err) throw err;
        console.log('Move of daily log file complete!');

        // Re-create file
        if (!fs.existsSync("./logs/dailyResets.json")) fs.writeFileSync("./logs/dailyResets.json", "[]");
    });

    // Move the hourly log file
    fs.rename('./logs/hourResets.json', './logs/old/' + hourly_file_new_name, (err) => {
        if (err) throw err;
        console.log('Move of hourly log file complete!');

        // Re-create file
        if (!fs.existsSync("./logs/hourResets.json")) fs.writeFileSync("./logs/hourResets.json", "[]");
    });

    // Re-plan new move
    planMoves();
}

// The function to plan the re-runs
function planMoves() {
    // Get the current date
    const currentDate = new Date;
    // Get hour, minute and second
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();
    const second = currentDate.getSeconds();
    // Calculate Timeout
    const hourTimeout = 23 - hour;
    const minuteTimeout = 49 - minute;
    const secondTimeout = 60 - second;
    // Re-calculate into seconds
    const hourTimeoutInSeconds = hourTimeout * 60 * 60;
    const minuteTimeoutInSeconds = minuteTimeout * 60;
    const fullTimeout = hourTimeoutInSeconds + minuteTimeoutInSeconds + secondTimeout;
    // Set the timeout
    setTimeout(() => {
        console.log("STARTING LOG MOVING");
        moveLogs();
    }, fullTimeout * 1000);
    // Log
    console.log("Planned Daily Log File Moving (In: " + fullTimeout + "s)");
}

function initialize() {
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
    if (!fs.existsSync("./logs/old")) fs.mkdirSync("./logs/old");
}

initialize();
planMoves();