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

// Loop every secong
setInterval(function() {

    // Decrease the timer
    timer--;

    // Check if 10 seconds have passed
    if (timer <= 0) {
        timer = 10;

        // Run the function to run the other script files
        run_10s_scripts();
    } else {
        console.log("Waiting [" + timer + "/10]");
    }

}, 1000);

// Function that runs all stuff that needs to be done every 10 seconds
function run_10s_scripts() {

    console.log("RUNNING");

    // Run ./mails/mailsender.js
    console.log("RUNNING MAILSENDER");
    exec('node ./mails/mailsender.js', function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        console.log(error);
    });
}