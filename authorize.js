// Get the mysql module
const mysql = require("mysql");

// Get the configuration file
const config = require("./config.json");

// Create a connection variable
var con = mysql.createConnection(config.mysql_connections.application);
con.connect(function(err) {
    if (err) {
        console.error(config.log_messages.mysql.error.authorization + err.stack);
        return;
    }
    console.log(config.log_messages.mysql.connect.authorization + con.threadId);
});

// Token-Authorization function
function authorizeToken(app_id = "", token = "", callback) {
    // Get data from db
    con.query("SELECT * FROM authentification WHERE app_id = '" + app_id + "'", function(error, results, fields) {
        // Check for error
        if (error) throw error;
        // Check for results
        if (!results) {
            console.log("Not authenticated");
        }
        // Check if token matches
        callback(results[0].auth_token == token);
    });
}

// Export functions
module.exports = {
    token: authorizeToken
}