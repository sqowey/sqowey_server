// Setup variables
const port = 3333;
const authTokenChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Get the express module
const express = require("express");
const api_log = require("./api_log.js")
const mysql = require("mysql");

// Create a connection variable
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sqowey_devportal"
});

// Initialize the api log
api_log.initLogFile();

// Create the express Instance
const API = express();

// Set up the api to get json requests
API.use(
    express.urlencoded({
        extended: true,
    })
);
API.use(express.json());

// Auth endpoint
API.get("/auth/", (req, res) => {
    // Get the body
    const body = req.body;
    const parsedbody = body; //JSON.parse(body);
    // Check if body is right
    if (!parsedbody.app_id || !parsedbody.app_secret) {
        res.status(400);
        res.json({ "error": "Bad request", "hint": "Your request is missing something! Please look into the Documentation" });
        api_log.writeLog("GET", "/AUTH/", 400, { "app_id": parsedbody.app_id });
        return;
    }
    // Create new auth token
    var auth_token = "";
    for (let i = 1; i < 48; i++) {
        auth_token += authTokenChars.charAt(Math.floor(Math.random() * authTokenChars.length));
    }
});

// Run the express server
API.listen(port, () => {
    // Log
    console.log("Express server running on Port:" + port);
    // Connect to 
    con.connect(function(err) {
        if (err) {
            console.error('Error connecting to mysql: ' + err.stack);
            return;
        }
        console.log('Mysql connection running as: ' + con.threadId);
    });
});