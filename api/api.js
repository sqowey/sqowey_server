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
// Get the generator module
const generate = require("./generator.js");
// Get the verification module
const verify = require("./verify.js");
// Get the configuration file
const config = require("../config.json");

// Create a connection variable
var devportal_db_connection = mysql.createConnection(config.general.mysql_connections.application);

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

// 
// Auth endpoint
// 
API.post("/auth/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    // Check if body is right
    if (!requestbody.app_id || !requestbody.app_secret) {
        res.status(400);
        res.json(config.api.messages.error.badRequest);
        api_log.writeLog("GET", "/AUTH/", 400, { "app_id": requestbody.app_id });
        return;
    }
    // Verify the input
    if (!verify.app_id(requestbody.app_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyAppId);
        api_log.writeLog("GET", "/AUTH/", 400, { "app_id": requestbody.app_id });
        return;
    }
    if (!verify.app_secret(requestbody.app_secret)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyAppSecret);
        api_log.writeLog("GET", "/AUTH/", 400, { "app_secret": requestbody.app_secret });
        return;
    }
    // Check if the app id matches the app secret
    devportal_db_connection.query("SELECT app_secret FROM apps WHERE app_id = \"" + requestbody.app_id + "\"", function(error, results, fields) {
        if (error) throw error;
        // Check if app can be found by id
        if (results == false) {
            res.status(401);
            res.json(config.api.messages.error.unknownAppId);
            api_log.writeLog("GET", "/AUTH/", 401, { "app_id": requestbody.app_id });
            return;
        }
        // Check if id matches secret
        if (results[0].app_secret != requestbody.app_secret) {
            res.status(403);
            res.json(config.api.messages.error.badAppSecret);
            api_log.writeLog("GET", "/AUTH/", 403, { "app_id": requestbody.app_id });
            return;
        }
        // Check if enougth tokens are left
        tokens.check(requestbody.app_id, config.api.endpoint_cost.auth.post, (check) => {
            if (!check) {
                res.status(429);
                res.json(config.api.messages.error.limit_reached);
                api_log.writeLog("GET", "/AUTH/", 429, { "app_id": requestbody.app_id });
                return;
            } else {
                // Reduce tokens
                tokens.reduce(config.api.endpoint_cost.auth.post, requestbody.app_id);
                // Delete old auth token entry
                devportal_db_connection.query("DELETE FROM authentification WHERE app_id = '" + requestbody.app_id + "'");
                // Generate a new auth token
                const auth_token = generate.auth_token();
                // Insert the auth token
                devportal_db_connection.query("INSERT INTO authentification (app_id, auth_token) VALUES ('" + requestbody.app_id + "', '" + auth_token + "')");
                // Respond with auth token
                res.status(201);
                res.json({ "app_id": requestbody.app_id, "auth_token": auth_token });
                api_log.writeLog("GET", "/AUTH/", 201, { "app_id": requestbody.app_id, "auth_token": auth_token });
            }
        });
    });
});

// 
// Applications endpoint
// 
API.get("/applications/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    const requestheaders = req.headers;
    // Check body
    if (!requestbody.app_id || !requestbody.dev_id) {
        res.status(400);
        res.json(config.api.messages.error.badRequest);
        api_log.writeLog("GET", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
        return;
    }
    // Verify the input
    if (!verify.app_id(requestbody.app_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyAppId);
        api_log.writeLog("GET", "/AUTH/", 400, { "app_id": requestbody.app_id });
        return;
    }
    if (!verify.user_id(requestbody.dev_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyDevId);
        api_log.writeLog("GET", "/AUTH/", 400, { "dev_id": requestbody.dev_id });
        return;
    }
    // Check authorization
    if (!requestheaders.authorization) {
        res.status(401);
        res.json(config.api.messages.error.badAuth);
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
            res.json(config.api.messages.error.unknownDevId);
            api_log.writeLog("GET", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
            return;
        }
        // Check if secret matches request secret
        if (results[0].dev_secret != requestheaders.authorization.replace("Dev ", "")) {
            res.status(401);
            res.json(config.api.messages.error.badDevSecret);
            api_log.writeLog("GET", "/APPLICATIONS/", 401, { "dev_id": requestbody.dev_id });
            return;
        }
        // Get application data
        devportal_db_connection.query("SELECT dev_id, app_id, app_level, tokens, app_name, app_created, last_used, app_secret, status FROM apps WHERE app_id = '" + requestbody.app_id + "'", (error, results, fields) => {
            // Check if there is an error
            if (error) throw error;
            // Check if app exists
            if (results == false) {
                res.status(401);
                res.json(config.api.messages.error.unknownAppId);
                api_log.writeLog("GET", "/APPLICATIONS/", 401, { "app_id": requestbody.app_id });
                return;
            }
            // Check if api is authorized to change the app
            if (results[0].dev_id != requestbody.dev_id) {
                res.status(403);
                res.json(config.api.messages.error.badAppOwner);
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
            console.log("SELECT auth_token, auth_registered FROM authentification WHERE app_id = '" + requestbody.app_id + "'");
            // Get the auth values
            devportal_db_connection.query("SELECT auth_token, auth_registered FROM authentification WHERE app_id = '" + requestbody.app_id + "'", (error, results, fields) => {
                // Check if there is an error
                if (error) throw error;
                // Set response values
                response.authentication.auth_token.requested = results[0].auth_registered || 0;
                response.authentication.auth_token.token = results[0].auth_token || 0;
                // Reduce tokens
                tokens.reduce(config.api.endpoint_cost.applications.get, requestbody.app_id);
                // Send response
                res.status(200);
                res.json(response);
                // Log
                api_log.writeLog("GET", "/APPLICATIONS/", 200, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
            });
        });
    });
});
API.post("/applications/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    const requestheaders = req.headers;
    // Check body
    if (!requestbody.app_name || !requestbody.dev_id) {
        res.status(400);
        res.json(config.api.messages.error.badRequest);
        api_log.writeLog("POST", "/APPLICATIONS/", 400, { "app_name": requestbody.app_name, "dev_id": requestbody.dev_id });
        return;
    }
    // Verify the input
    if (!verify.app_name(requestbody.app_name)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyAppName);
        api_log.writeLog("POST", "/AUTH/", 400, { "app_name": requestbody.app_name });
        return;
    }
    if (!verify.user_id(requestbody.dev_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyDevId);
        api_log.writeLog("POST", "/AUTH/", 400, { "dev_id": requestbody.dev_id });
        return;
    }
    // Check authorization
    if (!requestheaders.authorization) {
        res.status(401);
        res.json(config.api.messages.error.badAuth);
        api_log.writeLog("POST", "/APPLICATIONS/", 401, { "app_name": requestbody.app_name, "dev_id": requestbody.dev_id });
        return;
    }
    // Create a dev level var
    var dev_lvl;
    // Check if authorization is right (and get dev level)
    devportal_db_connection.query("SELECT dev_secret, dev_level FROM developers WHERE user_id = '" + requestbody.dev_id + "'", (error, results, fields) => {
        // Check if there is an error
        if (error) throw error;
        // Check if dev has been found
        if (results == false) {
            res.status(400);
            res.json(config.api.messages.error.unknownDevId);
            api_log.writeLog("POST", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
            return;
        }
        // Check if secret matches request secret
        if (results[0].dev_secret != requestheaders.authorization.replace("Dev ", "")) {
            res.status(401);
            res.json(config.api.messages.error.badDevSecret);
            api_log.writeLog("POST", "/APPLICATIONS/", 401, { "dev_id": requestbody.dev_id });
            return;
        }
        // Save dev level
        dev_lvl = results[0].dev_level;
    });
    // Generate a new app id
    generate.app_id((app_id) => {
        // Check if the user has apps left
        switch (dev_lvl) {
            case 1:
                var allowed_apps = 5;
                break;
            case 2:
                var allowed_apps = 20;
                break;
            case 3:
                var allowed_apps = 50;
                break;
            case 4:
                var allowed_apps = 100;
                break;
            case 5:
                var allowed_apps = 1000;
                break;
            case 6:
                var allowed_apps = 5000;
                break;
            case 9:
                var allowed_apps = 10000;
                break;
        }
        devportal_db_connection.query("SELECT * FROM apps WHERE dev_id = '" + requestbody.dev_id + "'", (error, results, fields) => {
            // Check if there is an error
            if (error) throw error;
            // Check if apps are used up
            if (allowed_apps <= results.length) {
                res.status(403);
                res.json(config.api.messages.error.noMoreApps);
                api_log.writeLog("POST", "/APPLICATIONS/", 403, { "dev_id": requestbody.dev_id });
                return;
            }
            // Generate the app secret
            const generated_app_secret = generate.app_secret();
            // Create the application
            devportal_db_connection.query("INSERT INTO apps (dev_id, app_id, app_level, tokens, app_name, app_secret) VALUES ('" + requestbody.dev_id + "', '" + app_id + "', 'B2', 75000, '" + requestbody.app_name + "', '" + generated_app_secret + "')", (error, results, fields) => {
                // Check if there is an error
                if (error) throw error;
                // Build the response json
                const response = {
                    "authentication": {
                        "app_secret": generated_app_secret
                    },
                    "app_name": requestbody.app_name,
                    "app_id": app_id,
                    "app_level": "B2",
                    "tokens_left": 75000
                };
                // Send response
                res.status(201);
                res.json(response);
                // Log
                api_log.writeLog("POST", "/APPLICATIONS/", 201, response);
            });
        });
    });
});
API.patch("/applications/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    const requestheaders = req.headers;
    // Check body
    if (!requestbody.app_id || !requestbody.dev_id || !requestbody.changes) {
        res.status(400);
        res.json(config.api.messages.error.badRequest);
        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id, "changes": requestbody.changes });
        return;
    }
    // Verify the app id and the dev id
    if (!verify.app_id(requestbody.app_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyAppId);
        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id });
        return;
    }
    if (!verify.user_id(requestbody.dev_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyDevId);
        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
        return;
    }
    // Check authorization
    if (!requestheaders.authorization) {
        res.status(401);
        res.json(config.api.messages.error.badAuth);
        api_log.writeLog("POST", "/APPLICATIONS/", 401, { "app_name": requestbody.app_name, "dev_id": requestbody.dev_id });
        return;
    }
    // Check if authorization is right
    devportal_db_connection.query("SELECT dev_secret FROM developers WHERE user_id = '" + requestbody.dev_id + "'", (error, results, fields) => {
        // Check if there is an error
        if (error) throw error;
        // Check if dev has been found
        if (results == false) {
            res.status(400);
            res.json(config.api.messages.error.unknownDevId);
            api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
            return;
        }
        // Check if secret matches request secret
        if (results[0].dev_secret != requestheaders.authorization.replace("Dev ", "")) {
            res.status(401);
            res.json(config.api.messages.error.badDevSecret);
            api_log.writeLog("PATCH", "/APPLICATIONS/", 401, { "dev_id": requestbody.dev_id });
            return;
        }
    });
    // Check if there are enough tokens left
    tokens.check(requestbody.app_id, requestbody.changes.length * config.api.endpoint_cost.applications.patch, (cb) => {
        if (!cb) {
            res.status(429);
            res.json(config.api.messages.error.limit_reached);
            api_log.writeLog("PATCH", "/APPLICATIONS/", 429, { "app_id": requestbody.app_id });
            return;
        }
        // Loop through the requested changes
        const requested_changes = requestbody.changes;
        requested_changes.forEach(req_change => {
            // Check if multiple changes have been requested in one request
            if (Object.keys(req_change).length != 1) {
                res.status(400);
                res.json(config.api.messages.error.badRequest);
                api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id, "changes": requested_changes });
                return;
            }
            // Reduce the tokens
            tokens.reduce(config.api.endpoint_cost.applications.patch, requestbody.app_id);
            // Get the change
            const change_key = Object.keys(req_change)[0];
            const change_value = req_change[change_key];
            // Switch the change
            // And set up the sql query
            switch (change_key) {
                case "app_name":
                    if (!verify.app_name(change_value)) {
                        res.status(400);
                        res.json(config.api.messages.error.unableVerifyAppName);
                        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_name": change_value });
                        return;
                    }
                    devportal_db_connection.query("UPDATE apps SET app_name='" + change_value + "'");
                    break;
                default:
                    res.status(400);
                    res.json(config.api.messages.error.badRequest);
                    api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id, "change_key": change_key, "change_value": change_value });
                    return;
            }
            // Check if last loop
            if (req_change = requested_changes[requested_changes.length - 1]) {
                res.status(200);
                res.json(config.api.messages.sucess.ok);
                api_log.writeLog("PATCH", "/APPLICATIONS/", 200, config.api.messages.sucess.ok);
            }
        });
    });
});
API.delete("/applications/", (req, res) => {
    // Get the body
    const requestbody = req.body;
    const requestheaders = req.headers;
    // Check body
    if (!requestbody.app_id || !requestbody.dev_id) {
        res.status(400);
        res.json(config.api.messages.error.badRequest);
        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id, "changes": requestbody.changes });
        return;
    }
    // Verify the app id and the dev id
    if (!verify.app_id(requestbody.app_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyAppId);
        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "app_id": requestbody.app_id });
        return;
    }
    if (!verify.user_id(requestbody.dev_id)) {
        res.status(400);
        res.json(config.api.messages.error.unableVerifyDevId);
        api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
        return;
    }
    // Check authorization
    if (!requestheaders.authorization) {
        res.status(401);
        res.json(config.api.messages.error.badAuth);
        api_log.writeLog("POST", "/APPLICATIONS/", 401, { "app_name": requestbody.app_name, "dev_id": requestbody.dev_id });
        return;
    }
    // Check if authorization is right
    devportal_db_connection.query("SELECT dev_secret FROM developers WHERE user_id = '" + requestbody.dev_id + "'", (error, results, fields) => {
        // Check if there is an error
        if (error) throw error;
        // Check if dev has been found
        if (results == false) {
            res.status(400);
            res.json(config.api.messages.error.unknownDevId);
            api_log.writeLog("PATCH", "/APPLICATIONS/", 400, { "dev_id": requestbody.dev_id });
            return;
        }
        // Check if secret matches request secret
        if (results[0].dev_secret != requestheaders.authorization.replace("Dev ", "")) {
            res.status(401);
            res.json(config.api.messages.error.badDevSecret);
            api_log.writeLog("PATCH", "/APPLICATIONS/", 401, { "dev_id": requestbody.dev_id });
            return;
        }
    });
    // Check if app owner is right
    devportal_db_connection.query("SELECT dev_id FROM apps WHERE app_id = '" + requestbody.app_id + "'", (error, results, fields) => {
        // Check if there is an error
        if (error) throw error;
        // Check if app exists
        if (!results) {
            res.status(401);
            res.json(config.api.messages.error.unknownAppId);
            api_log.writeLog("GET", "/APPLICATIONS/", 401, { "app_id": requestbody.app_id });
            return;
        }
        // Check if api is authorized to change the app
        if (results[0].dev_id != requestbody.dev_id) {
            res.status(403);
            res.json(config.api.messages.error.badAppOwner);
            api_log.writeLog("GET", "/APPLICATIONS/", 403, { "app_id": requestbody.app_id, "dev_id": requestbody.dev_id });
            return;
        }
    });
});


// Run the servers
API.listen(config.api.port, () => {
    // Log
    console.log(config.general.log_messages.express.connect.main + config.api.port);
    // Connect to the database
    devportal_db_connection.connect(function(err) {
        if (err) {
            console.error(config.general.log_messages.mysql.error.main + err.stack);
            return;
        }
        console.log(config.general.log_messages.mysql.connect.main + devportal_db_connection.threadId);
    });
});