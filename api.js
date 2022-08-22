// Setup variables
const port = 3333;

// Get the express module
const express = require("express");
const api_log = require("./api_log.js")

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
});

// Run the express server
API.listen(port, () => {
    console.log("Listening on Port: " + port);
});