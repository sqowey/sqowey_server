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
const current_timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var username;
var reciever;
var code;
var mail_template;
var mail_body;

// 
// Main
//

// Create a connection to the database
var connection = mysql.createConnection({
    host: config.db_tables.twofactor_mails.host,
    user: config.db_tables.twofactor_mails.user,
    password: config.db_tables.twofactor_mails.pass,
    database: config.db_tables.twofactor_mails.db
});
connection.connect();

// Create a mail transporter
var mail_transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
    }
});

// Update the mail in the database
connection.query(`UPDATE ` + config.db_tables.twofactor_mails.table + ` SET sent = "` + current_timestamp + `" WHERE sent IS NULL`, function(err, rows, fields) {
    console.log("Database updated: " + rows.affectedRows + " rows affected");
    console.log("Sending mails...");
});

// Get all mails from the database that are not sent yet
connection.query(`SELECT * FROM ` + config.db_tables.twofactor_mails.table + ` WHERE sent = "` + current_timestamp + `"`, function(err, rows, fields) {

    // Loop through the rows
    for (var i = 0; i < rows.length; i++) {

        // Get the values
        reciever = rows[i].reciever;
        username = rows[i].username;
        code = rows[i].code;

        // Get the mail template
        mail_template = fs.readFileSync("./mails/twofactor/template.html", 'utf8');

        // Replace the placeholders in the mail template
        mail_body = mail_template.replace("?USERNAME?", username).replace("?VERIFICATIONCODE?", code);

        // Send the mail
        mail_transporter.sendMail({
            from: config.mail.auth.user,
            to: reciever,
            subject: "Sqowey 2FA",
            html: mail_body
        }, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // Check if last iteration
        if (i == rows.length - 1) {

            // End connection to the database and close the transporter
            connection.end();
        }
    }
});