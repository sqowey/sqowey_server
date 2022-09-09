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