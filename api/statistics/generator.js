const fs = require("fs");
const currentDate = new Date().getTime();
const config = require("../../config.json");
// 
// DB CONN
// 

var account_db_connection = mysql.createConnection(config.general.mysql_connections.accounts);
account_db_connection.connect(function(err) {
    if (err) {
        console.error(config.general.log_messages.mysql.error.statistics_generation + err.stack);
        return;
    }
    console.log(config.general.log_messages.mysql.connect.statistics_generation + account_db_connection.threadId);
});

// 
// Token json printer
// 

function lastMonth() {
    var month_arr = [];
    var new_date = currentDate;
    for (let i = 0; i < 30; i++) {
        new_date = currentDate - 24 * 60 * 60 * 1000 * i;
        const year = new Date(new_date).getFullYear();
        const month = new Date(new_date).getMonth() + 1;
        const date = new Date(new_date).getDate();
        const path = __dirname + "/../../logs/old/resetInfo-Hourly-" + year + "-" + month + "-" + date + ".json";
        if (fs.existsSync(path)) {
            const day_json = JSON.stringify(JSON.parse(fs.readFileSync(path, "utf8")));
            const date_string = year + "-" + month + "-" + date
            day = { "date": date_string, "json": day_json }
            month_arr.push(day);
        } else {
            const date_string = year + "-" + month + "-" + date
            day = { "date": date_string, "json": "NOTHING HAPPENED ON " + date_string }
            month_arr.push(day);
        }
    }
    return month_arr;
}

function today() {
    const year = new Date(currentDate).getFullYear();
    const month = new Date(currentDate).getMonth() + 1;
    const date = new Date(currentDate).getDate();
    const path = __dirname + "/../../logs/old/resetInfo-Hourly-" + year + "-" + month + "-" + date + ".json";
    if (fs.existsSync(path)) {
        const day_json = JSON.stringify(JSON.parse(fs.readFileSync(path, "utf8")));
        const date_string = year + "-" + month + "-" + date
        day = { "date": date_string, "json": day_json }
    } else {
        const date_string = year + "-" + month + "-" + date
        day = { "date": date_string, "json": "NOTHING HAPPENED ON " + date_string }
    }
    return day;
}
// Testcommands
// console.log(lastMonth());
// console.log(today());

// 
// Latency measurement
// 

function getLatency(_callback) {
    var start = new Date();
    http.get({ host: config.general["latency-measure-endpoint"], port: 80 }, function(res) {
        _callback(new Date() - start);
    });
}
