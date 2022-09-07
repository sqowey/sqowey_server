// Get the configuration file
const config = require("./config.json");

// Check if app_id is structurally correct
function verify_app_id(app_id = "") {
    // Check if app_id is sent
    if (app_id == "") {
        return false;
    }
    // Check if length matches
    if (app_id.length != config.verification.length_limits.app_id) {
        return false;
    }
    // Check if chars match
    if (!app_id.match(/^([a-f0-9]){12}$/)) {
        return false;
    }
    return true;
}

// Export the functions
module.exports = {
    app_id: verify_app_id
}