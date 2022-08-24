// Get the express module
const express = require("express");
// Get the mysql module
const mysql = require("mysql");
// Get the api_log module
const api_log = require("./api_log.js");
// Get the configuration file
const config = require("./config.json");

// Create a connection variable
var devportal_db_connection = mysql.createConnection(config.mysql_connections.application);

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

// Function to reduce tokens
function reduceTokens(tokens, app_id) {
    devportal_db_connection.query("UPDATE apps SET tokens = tokens - " + tokens + " WHERE app_id = '" + app_id + "'", function(error, results, fields) {
        if (error) throw error;
    });
}

// Auth endpoint
API.post("/auth/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    // Check if body is right
    if (!requestbody.app_id || !requestbody.app_secret) {
        res.status(400);
        res.json(config.messages.error.badRequest);
        api_log.writeLog("GET", "/AUTH/", 400, { "app_id": requestbody.app_id });
        return;
    }
    // Check if the app id matches the app secret
    devportal_db_connection.query("SELECT app_secret FROM apps WHERE app_id = \"" + requestbody.app_id + "\"", function(error, results, fields) {
        if (error) throw error;
        // Check if app can be found by id
        if (results == false) {
            res.status(401);
            res.json(config.messages.error.unknownAppId);
            api_log.writeLog("GET", "/AUTH/", 401, { "app_id": requestbody.app_id });
            return;
        }
        // Check if id matches secret
        if (results[0].app_secret != requestbody.app_secret) {
            res.status(403);
            res.json(config.messages.error.badAppSecret);
            api_log.writeLog("GET", "/AUTH/", 403, { "app_id": requestbody.app_id });
            return;
        }
        // Reduce tokens
        reduceTokens(config.endpoint_cost.auth.post, requestbody.app_id);
        // Delete old auth token entry
        devportal_db_connection.query("DELETE FROM authentification WHERE app_id = '" + requestbody.app_id + "'");
        // Create new auth token
        var auth_token = "";
        for (let i = 1; i < 48; i++) {
            auth_token += config.endpointSettings.auth.tokenChars.charAt(Math.floor(Math.random() * config.endpointSettings.auth.tokenChars.length));
        }
        // Insert the auth token
        devportal_db_connection.query("INSERT INTO authentification (app_id, auth_token) VALUES ('" + requestbody.app_id + "', '" + auth_token + "')");
        // Respond with auth token
        res.status(201);
        res.json({ "app_id": requestbody.app_id, "auth_token": auth_token });
        api_log.writeLog("GET", "/AUTH/", 201, { "app_id": requestbody.app_id, "auth_token": auth_token });
    });
});

// Run the express server
API.listen(config.apiPort, () => {
    // Log
    console.log("Express server running on Port:" + config.apiPort);
    // Connect to 
    devportal_db_connection.connect(function(err) {
        if (err) {
            console.error('Error connecting to mysql: ' + err.stack);
            return;
        }
        console.log('Mysql connection running as: ' + devportal_db_connection.threadId);
    });
});