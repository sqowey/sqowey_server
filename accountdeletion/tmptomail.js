// !WARNING!
// THIS FILE HAS TO BE RUN FROM THE ROOT DIRECTORY (FROM THE PARENT FOLDER OF THE FOLDER WHERE THIS FILE IS)
// !WARNING!


// 
// Modules
// 
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const fs = require('fs');

// 
// Variables
// 
const config = require('../../config.json');
var username;
var timestamp;

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
var mail_connection = mysql.createConnection({
    host: config.db_tables.acc_del_mails.host,
    user: config.db_tables.acc_del_mails.user,
    password: config.db_tables.acc_del_mails.pass,
    database: config.db_tables.acc_del_mails.db
});
tmp_connection.connect();
mail_connection.connect();


// Get the id and timestamp from the database
tmp_connection.query(`SELECT user_id, delete_until FROM ` + config.db_tables.tmp_accountdeletion.table, function(err, result) {
    if (err) throw err;
    for (var i = 0; i < result.length; i++) {
        username = result[i].user_id;
        timestamp = result[i].delete_until;

    }

});