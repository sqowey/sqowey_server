// Get the configuration file
const config = require("../../config.json");
// Get the mysql module
const mysql = require("mysql");


// Create a connection variable
var conn = mysql.createConnection(config.general.mysql_connections.application);
// Connect to the database
conn.connect(function(err) {
    if (err) {
        console.error(config.general.log_messages.mysql.error.token_reset + err.stack);
        return;
    }
    console.log(config.general.log_messages.mysql.connect.token_reset + conn.threadId);
});


// Function to get midnight-reset-timed apps
function getMidnighters(callback) {
    // Create a variable to store the apps
    let midnight_apps = [];
    // Get the B1 apps from the database
    conn.query("SELECT app_level, app_id, tokens FROM apps WHERE app_level = 'B1' OR app_level = 'B2' OR app_level = 'A1' OR app_level = 'A2'", function(error, results, fields) {
        // Check for error
        if (error) throw error;
        // Check for results
        if (!results) {
            console.log("No midnight-reset-apps found");
        }
        midnight_apps = JSON.parse(JSON.stringify(results));
        callback(midnight_apps);
    });
}

function resetMidnighters() {
    getMidnighters((apps) => {
        var tokens_refilled = 0;
        apps.forEach(element => {
            switch (element.app_level) {
                case "B1":
                    var tokens_refill = 5000;
                    var tokens_needed = tokens_refill - element.tokens;
                    break;
                case "B2":
                    var tokens_refill = 50000;
                    var tokens_needed = tokens_refill - element.tokens;
                    break;
                case "A1":
                    var tokens_refill = 100000;
                    var tokens_needed = tokens_refill - element.tokens;
                    break;
                case "A2":
                    var tokens_refill = 500000;
                    var tokens_needed = tokens_refill - element.tokens;
                    break;
            }
            if (tokens_needed < 0) {
                tokens_needed = 0;
            }
            tokens_refilled += tokens_needed;
            if (tokens_needed != 0) {
                conn.query("UPDATE apps SET tokens = " + tokens_refill + " WHERE app_id = '" + element.app_id + "'");
            }
        });
    });
}

// Function to get midnight-reset-timed apps
function getHourResetters(callback) {
    // Create a variable to store the apps
    let hour_apps = [];
    // Get the E-apps from the database
    conn.query("SELECT app_level, app_id, tokens FROM apps WHERE app_level = 'E1' OR app_level = 'E2'", function(error, results, fields) {
        // Check for error
        if (error) throw error;
        // Check for results
        if (!results) {
            console.log("No hour-reset-apps found");
        }
        hour_apps = JSON.parse(JSON.stringify(results));
        callback(hour_apps);
    });
}

function resetHourResetters() {
    getHourResetters((apps) => {
        var tokens_refilled = 0;
        apps.forEach(element => {
            switch (element.app_level) {
                case "E1":
                    var tokens_refill = 50000;
                    var tokens_needed = tokens_refill - element.tokens;
                    break;
                case "E2":
                    var tokens_refill = 150000;
                    var tokens_needed = tokens_refill - element.tokens;
                    break;
            }
            if (tokens_needed < 0) {
                tokens_needed = 0;
            }
            tokens_refilled += tokens_needed;
            if (tokens_needed != 0) {
                conn.query("UPDATE apps SET tokens = " + tokens_refill + " WHERE app_id = '" + element.app_id + "'");
            }
        });
        console.log("Refilled hour Tokens (" + tokens_refilled + " Tokens)");
        planHourly();
    });
}

function planHourly() {
    // Get the current date
    const currentDate = new Date;
    // Get minute and second
    const minute = currentDate.getMinutes();
    const second = currentDate.getSeconds();
    // Calculate Timeout
    const minuteTimeout = 59 - minute;
    const secondTimeout = 60 - second;
    // Re-calculate into seconds
    const minuteTimeoutInSeconds = minuteTimeout * 60;
    const fullTimeout = minuteTimeoutInSeconds + secondTimeout;
    // Set the timeout
    setTimeout(() => {
        console.log("STARTING HOUR TOKEN RESET");
        resetHourResetters();
    }, fullTimeout * 1000);
    // Log
    console.log("Planned Hour Token reset (In: " + fullTimeout + "s)");
}

planHourly();