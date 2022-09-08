// Get the mysql module
const mysql = require("mysql");

// Get the configuration file
const config = require("../config.json");

// Create a connection variable
var con = mysql.createConnection(config.general.mysql_connections.application);
con.connect(function(err) {
    if (err) {
        console.error(config.general.log_messages.mysql.error.tokenActions + err.stack);
        return;
    }
    console.log(config.general.log_messages.mysql.connect.tokenActions + con.threadId);
});

// Token-Authorization function
function reduceTokens(tokens = 1, app_id) {
    con.query("UPDATE apps SET tokens = tokens - " + tokens + " WHERE app_id = '" + app_id + "'", function(error, results, fields) {
        if (error) throw error;
    });
}

// Token checker 
function checkTokens(app_id, neededTokens = 100, callback) {
    con.query("SELECT tokens FROM apps WHERE app_id = '" + app_id + "'", function(error, results, fields) {
        if (!results[0].tokens || !results) {
            callback(true);
            return;
        }
        if (results[0].tokens >= neededTokens) {
            callback(true);
            return;
        }
        callback(false);
    });

}

// Export functions
module.exports = {
    reduce: reduceTokens,
    check: checkTokens
}