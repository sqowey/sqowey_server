// Get the express module
const express = require("express");
// Get the mysql module
const mysql = require("mysql");
// Get the api_log module
const api_log = require("./api_log.js");
// Get the authorizing module
const authorize = require("./authorize.js");
// Get the tokenActions module
const tokens = require("./tokenActions.js");
// Get the verification module
const verify = require("./verify.js");
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
        tokens.reduce(config.endpoint_cost.auth.post, requestbody.app_id);
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

API.get("/applications/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    const requestheaders = req.headers;
    // Check body
    if (!requestbody.app_id || !requestbody.dev_id) {
        res.status(400);
        res.json(config.messages.error.badRequest);
        api_log.writeLog("GET", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
        return;
    }
    // Check authorization
    if (!requestheaders.authorization) {
        res.status(401);
        res.json(config.messages.error.badAuth);
        api_log.writeLog("GET", "/APPLICATIONS/", 401, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
        return;
    }
    // Check if authorization is right
    devportal_db_connection.query("SELECT dev_secret FROM developers WHERE user_id = '" + requestbody.dev_id + "'", (error, results, fields) => {
        // Check if there is an error
        if (error) throw error;
        // Check if dev has been found
        if (results == false) {
            res.status(400);
            res.json(config.messages.error.unknownDevId);
            api_log.writeLog("GET", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
            return;
        }
        // Check if secret matches request secret
        if (results[0].dev_secret != requestheaders.authorization.replace("Dev ", "")) {
            res.status(401);
            res.json(config.messages.error.badDevSecret);
            api_log.writeLog("GET", "/APPLICATIONS/", 403, { "dev_id": requestbody.dev_id });
            return;
        }
        // Get application data
        devportal_db_connection.query("SELECT dev_id, app_id, app_level, tokens, app_name, app_created, last_used, app_secret, status FROM apps WHERE app_id = '" + requestbody.app_id + "'", (error, results, fields) => {
            // Check if there is an error
            if (error) throw error;
            // Check if app exists
            if (results == false) {
                res.status(401);
                res.json(config.messages.error.unknownAppId);
                api_log.writeLog("GET", "/APPLICATIONS/", 401, { "app_id": requestbody.app_id });
                return;
            }
            // Check if api is authorized to change the app
            if (results[0].dev_id != requestbody.dev_id) {
                res.status(403);
                res.json(config.messages.error.badAppOwner);
                api_log.writeLog("GET", "/APPLICATIONS/", 403, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
                return;
            }
            // Build the response json
            const response = {
                "owner": results[0].dev_id,
                "authentication": {
                    "app_secret": results[0].app_secret,
                    "auth_token": {
                        "requested": "",
                        "token": ""
                    }
                },
                "last_opened_in_devportal": results[0].last_used,
                "app_name": results[0].app_name,
                "app_id": results[0].app_id,
                "status": results[0].status || 0,
                "app_level": results[0].app_level,
                "tokens_left": results[0].tokens,
                "app_created": results[0].app_created
            };
            // Get the auth values
            devportal_db_connection.query("SELECT auth_token, auth_registered FROM authentification WHERE app_id = '" + requestbody.app_id + "'", (error, results, fields) => {
                // Check if there is an error
                if (error) throw error;
                // Set response values
                response.authentication.auth_token.requested = results[0].auth_registered || 0;
                response.authentication.auth_token.token = results[0].auth_token || 0;
                // Reduce tokens
                tokens.reduce(config.endpoint_cost.applications.get, requestbody.app_id);
                // Send response
                res.status(200);
                res.json(response);
                // Log
                api_log.writeLog("GET", "/APPLICATIONS/", 200, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
            });
        });
    });
});

// Run the express server
API.listen(config.apiPort, () => {
    // Log
    console.log(config.log_messages.express.connect.main + config.apiPort);
    // Connect to 
    devportal_db_connection.connect(function(err) {
        if (err) {
            console.error(config.log_messages.mysql.error.main + err.stack);
            return;
        }
        console.log(config.log_messages.mysql.connect.main + devportal_db_connection.threadId);
    });
});