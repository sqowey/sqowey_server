// Get the configuration file
const config = require("../config.json");

// Check if app_id is structurally correct
function verify_app_id(app_id = "") {
    // Check if app_id is sent
    if (app_id == "") {
        return false;
    }
    // Check if length matches
    if (app_id.length != config.api.verification.length_limits.app_id) {
        return false;
    }
    // Check if chars match
    if (!app_id.match(/^([a-f0-9]){12}$/)) {
        return false;
    }
    return true;
}

// Check if user_id is structurally correct
function verify_user_id(user_id = "") {
    // Check if user_id is sent
    if (user_id == "") {
        return false;
    }
    // Check if length matches
    if (user_id.length != config.api.verification.length_limits.user_id) {
        return false;
    }
    // Check if chars match
    if (!user_id.match(/^([a-z0-9-]){36}$/)) {
        return false;
    }
    return true;
}

// Check if server_id is structurally correct
function verify_server_id(server_id = "") {
    // Check if user_id is sent
    if (server_id == "") {
        return false;
    }
    // Check if length matches
    if (server_id.length != config.api.verification.length_limits.server_id) {
        return false;
    }
    // Check if chars match
    if (!server_id.match(/^([a-z0-9]){8}$/)) {
        return false;
    }
    return true;
}

// Verifing function for app secret
function verify_app_secret(app_secret = "") {
    // Check if app_secret is sent
    if (app_secret == "") {
        return false;
    }
    // Check if length matches
    if (app_secret.length != config.api.verification.length_limits.app_secret) {
        return false;
    }
    // Check if chars match
    if (!app_secret.match(/^([a-zA-Z0-9]){64}$/)) {
        return false;
    }
    return true;
}

// Verifiying function for app name
function verify_app_name(app_name = "") {
    // Check if app_name is sent
    if (app_name == "") {
        return false;
    }
    // Check if chars match
    if (!app_name.match(/^([a-zA-Z0-9]){3-12}$/)) {
        return false;
    }
    return true;
}

// Export the functions
module.exports = {
    app_id: verify_app_id,
    user_id: verify_user_id,
    server_id: verify_server_id,
    app_secret: verify_app_secret,
    app_name: verify_app_name
}