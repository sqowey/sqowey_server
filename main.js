// 
// Modules
// 

const exec = require('child_process').exec;

// 
// Variables
// 
var timer = 0;

// 
// Main
//

// Loop every 10 seconds
setInterval(function() {

    // Decrease the timer
    timer--;

    // Run the function to run the other script files
    run_10s_scripts();

}, 10000);

// Function that runs all stuff that needs to be done every 10 seconds
function run_10s_scripts() {

    // Run ./mails/mailsender.js
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
}