// !WARNING!
// THIS FILE HAS TO BE RUN FROM THE ROOT DIRECTORY (FROM THE PARENT FOLDER OF THE FOLDER WHERE THIS FILE IS)
// !WARNING!


// 
// Modules
// 
const mysql = require('mysql');

// 
// Variables
// 
const config = require('../config.json');

// 
// Main
//

// Create a connection to the database
var tmp_connection = mysql.createConnection({
    host: config.db_tables.tmp_accountdeletion.host,
    user: config.db_tables.tmp_accountdeletion.user,
    password: config.db_tables.tmp_accountdeletion.pass,
    database: config.db_tables.tmp_accountdeletion.db
});
tmp_connection.connect();


// Get the id and timestamp from the database
tmp_connection.query(`DELETE FROM ` + config.db_tables.tmp_accountdeletion.table + " WHERE mails_created = 1;", function(err, result) {

    // If error
    if (err) throw err;

    // Close the connection
    tmp_connection.end();
});