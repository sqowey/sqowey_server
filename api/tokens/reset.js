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
function getMidnighters() {
    // Get the B1 apps from the database
    conn.query("SELECT * FROM apps WHERE app_level = 'B1' OR app_level = 'B2' OR app_level = 'A1' OR app_level = 'A2'", function(error, results, fields) {
        // Check for error
        if (error) throw error;
        // Check for results
        if (!results) {
            console.log("No midnight-reset-apps found");
        }
    });
}

getMidnighters();