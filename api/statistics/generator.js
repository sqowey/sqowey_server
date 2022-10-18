const fs = require("fs");
const currentDate = new Date().getTime();
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
