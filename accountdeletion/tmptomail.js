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
const config = require('../config.json');
const { time } = require('console');
var username;
var timestamp;
var email;
var sql;

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
tmp_connection.query(`SELECT user_id, user_email, delete_until FROM ` + config.db_tables.tmp_accountdeletion.table, function(err, result) {

    // If error
    if (err) throw err;

    // Loop through the results
    for (var i = 0; i < result.length; i++) {
        user_id = result[i].user_id;
        email = result[i].user_email;
        delete_timestamp = result[i].delete_until;

        // Get a current date and time in a format that can be used with mysql
        var date = new Date();
        var current_date_mysql = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

        // Turn the delete_timestamp into a format that can be used with mysql
        var delete_timestamp_mysql = delete_timestamp.getFullYear() + '-' + (delete_timestamp.getMonth() + 1) + '-' + delete_timestamp.getDate() + ' ' + delete_timestamp.getHours() + ':' + delete_timestamp.getMinutes() + ':' + delete_timestamp.getSeconds();

        // Create a new mail
        sql = "INSERT INTO " + config.db_tables.acc_del_mails.table + " (user_id, send_timestamp, deletion_timestamp, type) VALUES (" + user_id + ",\"" + current_date_mysql + "\",\"" + delete_timestamp_mysql + "\", 1);";
        mail_connection.query(sql, function(err, result) {
            // If error
            if (err) throw err;
        });

        // Create a new mail
        sql = "INSERT INTO " + config.db_tables.acc_del_mails.table + " (user_id, send_timestamp, deletion_timestamp, type) VALUES (" + user_id + ",\"" + delete_timestamp_mysql + "\",\"" + delete_timestamp_mysql + "\", 3);";
        mail_connection.query(sql, function(err, result) {
            // If error
            if (err) throw err;
        });

    }
});