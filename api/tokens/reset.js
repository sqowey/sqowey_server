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
