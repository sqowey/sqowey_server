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
    for (let i = 1; i < 48; i++) {
        // Generate a new random character
        const new_char = config.api.endpointSettings.auth.tokenChars.charAt(Math.floor(Math.random() * config.api.endpointSettings.auth.tokenChars.length));
        // Add the newly generated char to the full string
        auth_token += new_char;
    }
    // Return the string
    return auth_token;
}

module.exports = {
    auth_token: newAuthToken
}