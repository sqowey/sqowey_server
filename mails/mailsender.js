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
const mail_config = require('./mails.json');
var mail_array;

// 
// Main
//

// Create a connection to the database
var connection = mysql.createConnection({
    host: config.db_tables.mails.host,
    user: config.db_tables.mails.user,
    password: config.db_tables.mails.pass,
    database: config.db_tables.mails.db
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


// Get all mails from the database that are not sent yet
connection.query(`SELECT * FROM ` + config.db_tables.mails.table + ` WHERE sent = 0 AND mail_type = 1`, function(err, rows, fields) {

    // Loop through the rows
    for (var i = 0; i < rows.length; i++) {

        // Get the values
        var mail_type = rows[i].mail_type;
        var reciever = rows[i].reciever;
        var mail_id = rows[i].mail_id;
        var details = rows[i].details;

        // Get the mail subject from the mail_config
        switch (mail_type) {
            case 1:
                var mail_subject = mail_config[1].subject;
                var mail_template_path = mail_config[1].mail;
                break;
            case 2:
                var mail_subject = mail_config[2].subject;
                var mail_template_path = mail_config[2].mail;
                break;
        }

        // Get the mail template
        var mail_template = fs.readFileSync(mail_template_path, 'utf8');

        // Replace the placeholders in the mail template
        switch (mail_type) {
            case 1:
                var mail_body = mail_template.replace("?USERNAME?", reciever).replace("?VERIFICATIONCODE?", details);
                break;
        }

        // Send the mail
        mail_transporter.sendMail({
            from: config.mail.auth.user,
            to: reciever,
            subject: mail_subject,
            html: mail_body
        }, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    }
});