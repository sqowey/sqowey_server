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
const current_timestamp = new Date().getTime();
var user_email;
var send_timestamp;
var deletion_timestamp;
var type;
var mail_id;
var user_id;
var mail_title;
var mail_content;

// 
// Main
//

// Create a connection to the database
var connection = mysql.createConnection({
    host: config.db_tables.acc_del_mails.host,
    user: config.db_tables.acc_del_mails.user,
    password: config.db_tables.acc_del_mails.pass,
    database: config.db_tables.acc_del_mails.db
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
    },
    pool: true
});

// Get all mails from the database that are not sent yet
connection.query(`SELECT * FROM ` + config.db_tables.acc_del_mails.table, function(err, rows, fields) {

    // If there are no results
    if (!rows) {
        console.log('No mails to send');
        connection.end();
        process.exit();
    }

    // Check if there are any mails to send
    if (rows.length > 0) {

        // Log
        console.log("Sending Account-deletion-mails...");

        // Loop through the rows
        for (var i = 0; i < rows.length; i++) {

            // Get the values
            user_email = rows[i].user_email;
            send_timestamp = rows[i].send_timestamp;
            deletion_timestamp = rows[i].deletion_timestamp;
            type = rows[i].type;
            mail_id = rows[i].mail_id;
            user_id = rows[i].user_id;

            // Make a unix timestamp out of the send_timestamp
            var send_timestamp_unix = new Date(send_timestamp).getTime();

            // Check if the send_timestamp is in the past
            if (send_timestamp_unix < current_timestamp) {

                // switch the type
                switch (type) {
                    case 1:

                        // Get the mail content
                        fs.readFile('./mails/accdeletion/del1.html', 'utf8', function(err, data) {

                            // Check if there was an error
                            if (err) throw err;

                            // Set the mail content
                            mail_content = data.replace("?USERNAME?", user_email.split("@")[0]).replace("?DATE?", new Date(deletion_timestamp).toLocaleDateString()).replace("?EMAIL?", user_email);
                        });

                        // Set the mail title
                        mail_title = "Account-Deletion requested";

                        // Exit switch
                        break;
                    case 2:

                        // Get the mail content
                        fs.readFile('./mails/accdeletion/del2.html', 'utf8', function(err, data) {

                            // Check if there was an error
                            if (err) throw err;

                            // Set the mail content
                            mail_content = data.replace("?USERNAME?", user_email.split("@")[0]).replace("?DATE?", new Date(deletion_timestamp).toLocaleDateString()).replace("?EMAIL?", user_email);
                        });

                        // Set the mail title
                        mail_title = "Account-Deletion reminder";

                        // Exit switch
                        break;
                    case 3:

                        // Get the mail content
                        fs.readFile('./mails/accdeletion/del3.html', 'utf8', function(err, data) {

                            // Check if there was an error
                            if (err) throw err;

                            // Set the mail content
                            mail_content = data.replace("?USERNAME?", user_email.split("@")[0]).replace("?DATE?", new Date(deletion_timestamp).toLocaleDateString()).replace("?EMAIL?", user_email);
                        });

                        // Exit switch
                        break;
                }

                // Send the mail
                mail_transporter.sendMail({
                    from: config.mail.from,
                    to: "cuzimbisonratte@gmail.com",
                    subject: mail_title,
                    html: mail_content
                }, function(err, info) {

                    // Check if there was an error
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });

                // Delete the mail from the database
                connection.query(`DELETE FROM ` + config.db_tables.acc_del_mails.table + ` WHERE mail_id = ?`, mail_id, function(err, rows, fields) {
                    if (err) throw err;
                });
            }

            // Check if last iteration
            if (i == rows.length - 1) {

                // End connection to the database and close the transporter
                connection.end();
            }
        }
    } else {

        // Log
        console.log("No 2FA-mails to send");

        // Close
        connection.end();
    }
});