// Get the mysql module
const mysql = require("mysql");

// Get the configuration file
const config = require("./config.json");

// Create a connection variable
var con = mysql.createConnection(config.mysql_connections.application);
con.connect(function(err) {
    if (err) {
        console.error(config.log_messages.mysql.error.tokenActions + err.stack);
        return;
    }
    console.log(config.log_messages.mysql.connect.tokenActions + con.threadId);
});

// Token-Authorization function
function reduceTokens(tokens = 1, app_id) {
    con.query("UPDATE apps SET tokens = tokens - " + tokens + " WHERE app_id = '" + app_id + "'", function(error, results, fields) {
        if (error) throw error;
    });
}

// Export functions
module.exports = {
    reduce: reduceTokens
}