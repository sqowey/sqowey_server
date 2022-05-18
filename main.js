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
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }
    });

}, 10000);