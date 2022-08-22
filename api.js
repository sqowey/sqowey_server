// Get the express module
const express = require("express");
// Get the mysql module
const mysql = require("mysql");
// Get the api_log module
const api_log = require("./api_log.js");
// Get the configuration file
const config = require("./config.json");

// Create a connection variable
var mysql_con = mysql.createConnection(config.mysql_connection);

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
    // Check if the app id matches the app secret
    mysql_con.query("SELECT app_secret FROM apps WHERE app_id = \"" + parsedbody.app_id + "\"", function(error, results, fields) {
        if (error) throw error;
        // Check if app can be found by id
        if (results == false) {
            res.status(401);
            res.json({ "error": "Unknown app ID", "hint": "The used app id is unknown! Please check the devportal!" });
            api_log.writeLog("GET", "/AUTH/", 401, { "app_id": parsedbody.app_id });
            return;
        }
        // Check if id matches secret
        if (results[0].app_secret != parsedbody.app_secret) {
            res.status(403);
            res.json({ "error": "Wrong App secret", "hint": "The used app secret is wrong! Please check the devportal!" });
            api_log.writeLog("GET", "/AUTH/", 403, { "app_id": parsedbody.app_id });
            return;
        }
        // Delete old auth token entry
        mysql_con.query("DELETE FROM authentification WHERE app_id = '" + parsedbody.app_id + "'");
        // Create new auth token
        var auth_token = "";
        for (let i = 1; i < 48; i++) {
            auth_token += config.endpointSettings.auth.tokenChars.charAt(Math.floor(Math.random() * config.endpointSettings.auth.tokenChars.length));
        }
        // Insert the auth token
        mysql_con.query("INSERT INTO authentification (app_id, auth_token) VALUES ('" + parsedbody.app_id + "', '" + auth_token + "')");
        // Respond with auth token
        res.status(201);
        res.json({ "app_id": parsedbody.app_id, "auth_token": auth_token });
        api_log.writeLog("GET", "/AUTH/", 201, { "app_id": parsedbody.app_id, "auth_token": auth_token });
    });
});

// Run the express server
API.listen(config.apiPort, () => {
    // Log
    console.log("Express server running on Port:" + config.apiPort);
    // Connect to 
    mysql_con.connect(function(err) {
        if (err) {
            console.error('Error connecting to mysql: ' + err.stack);
            return;
        }
        console.log('Mysql connection running as: ' + mysql_con.threadId);
    });
});