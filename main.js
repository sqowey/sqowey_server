// 
// Modules
// 
const exec = require('child_process').exec;

// 
// Main
//

// Loop every 10 seconds
setInterval(function() {

    // Run ./mails/twofactor/mailsender.js
    console.log("2FA-Mailer running");
    exec('node ./mails/twofactor/mailsender.js', function(error, stdout, stderr) {
        if (error) {
            console.log(error);
        }
        if (stderr) {
            console.log(stderr);
        }
    });

}, 1000 * 10);

// Loop every 1 minute
setInterval(function() {

    // Run ./mails/accdeletion/mailsender.js
    console.log("Account-deletion-Mailer running");
    exec('node ./mails/accdeletion/mailsender.js', function(error, stdout, stderr) {
        if (error) {
            console.log(error);
        }
        if (stderr) {
            console.log(stderr);
        }
    });

    // Run ./accdeletion/delfromtmp.js
    // Run ./accdeletion/tmptomail.js
    console.log("Account-deletion-cleaneup running");
    exec('node ./accountdeletion/delfromtmp.js', function(error, stdout, stderr) {
        if (error) {
            console.log(error);
        }
        if (stderr) {
            console.log(stderr);
        }
    });
    exec('node ./accountdeletion/tmptomail.js', function(error, stdout, stderr) {
        if (error) {
            console.log(error);
        }
        if (stderr) {
            console.log(stderr);
        }
    });
}, 1000 * 60);