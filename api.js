// Setup variables
const port = 3333;

// Get the express module
const express = require("express");

// Create the express Instance
const API = express();

// Set up the api to get json requests
API.use(
    express.urlencoded({
        extended: true,
    })
);
API.use(express.json());


// Run the express server
API.listen(port, () => {
    console.log("Listening on Port: " + port);
});