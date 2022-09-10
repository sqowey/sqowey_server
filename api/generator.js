// Get the configuration file
const config = require("../config.json");
// Get the mysql module
const mysql = require("mysql");

// Create a connection to the db
var db_conn = mysql.createConnection(config.general.mysql_connections.application);
db_conn.connect(function(err) {
    if (err) {
        console.error(config.general.log_messages.mysql.error.generator + err.stack);
        return;
    }
    console.log(config.general.log_messages.mysql.connect.generator + db_conn.threadId);
});

function newAuthToken() {
    // Create new auth token
    var auth_token = "";
    // Loop 48 times
    for (let i = 0; i < config.api.verification.length_limits.auth_token; i++) {
        // Generate a new random character
        const new_char = config.api.endpointSettings.auth.tokenChars.charAt(Math.floor(Math.random() * config.api.endpointSettings.auth.tokenChars.length));
        // Add the newly generated char to the full string
        auth_token += new_char;
    }
    // Return the string
    return auth_token;
}

function newAppID(callback) {
    // Create new auth token
    var new_app_id = "";
    // Loop
    for (let i = 0; i < config.api.verification.length_limits.app_id; i++) {
        // Generate a new random character
        const new_char = config.api.endpointSettings.applications.tokenChars.charAt(Math.floor(Math.random() * config.api.endpointSettings.applications.tokenChars.length));
        // Add the newly generated char to the full string
        new_app_id += new_char;
    }
    // Check if the app id is already in use
    db_conn.query("SELECT * FROM apps WHERE app_id = '" + new_app_id + "'", function(error, results, fields) {
        // Check for error
        if (error) throw error;
        // Check for results
        if (!results[0]) {
            // Check if token matches
            callback(new_app_id);
        } else {
            newAppID(callback);
        }
    });
}

function newAppSecret() {
    // Create new app scret
    var app_secret = "";
    // Loop 64 times
    for (let i = 0; i < config.api.verification.length_limits.app_secret; i++) {
        // Generate a new random character
        const new_char = config.api.endpointSettings.applications.app_secret.chars.charAt(Math.floor(Math.random() * config.api.endpointSettings.applications.app_secret.chars.length));
        // Add the newly generated char to the full string
        app_secret += new_char;
    }
    // Return the string
    return app_secret;
}

module.exports = {
    auth_token: newAuthToken,
    app_id: newAppID,
    app_secret: newAppSecret
}