// Get the configuration file
const config = require("../config.json");

function newAuthToken() {
    // Create new auth token
    var auth_token = "";
    // Loop 48 times
    for (let i = 1; i < 48; i++) {
        // Generate a new random character
        const new_char = config.api.endpointSettings.auth.tokenChars.charAt(Math.floor(Math.random() * config.api.endpointSettings.auth.tokenChars.length));
        // Add the newly generated char to the full string
        auth_token += new_char;
    }
    // Return the string
    return auth_token;
}

module.exports = {
    auth_token: newAuthToken
}