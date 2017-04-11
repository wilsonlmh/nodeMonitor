var config = {
    hostname: "example.com",
    storePath: "/tmp/nodeMonitor.json",
    modules: [
        {
            func: require("./modules/IPSec"),
            addMsg: "{[user]}({[remoteIp]}) connected IPSec as {[tunnelIp]}",
            delMsg: "{[user]} disconnected {[tunnelIp]} IPSec"
        },
        {
            func: require("./modules/ssh"),
            addMsg: "{[username]}({[remoteIp]}) connected SSH",
            delMsg: "{[username]}({[remoteIp]}) disconnected SSH"
        }],
    telegram: {
        chatID: "",
        botID: "",
    }
}

var current = {
    currentModuleStatus: [],
    lastModuleStatus: [[], []],
    differents: [],
}

var https = require('https');
var fs = require('fs');

function listObject(target) {
    var result = "";
    for (var key in target) {
        if (typeof target[key] !== 'function' && target.hasOwnProperty(key)) {
            result += key + ":" + target[key] + ",";
        }
    }
    if (result != "") {
        result.substring(0, result.length - 1);
    }
    return result;
}


function compareArray(a, b) {
    var x = [];
    var y = [];
    var result = {
        "added": [],
        "deleted": []
    };
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (JSON.stringify(a[i]) == JSON.stringify(b[j])) {
                x[i] = true;
                y[j] = true;
            }
        }
    }
    for (var i = 0; i < a.length; i++) {
        if (typeof x[i] == "undefined") {
            result.deleted.push(a[i]);
        }
    }
    for (var j = 0; j < b.length; j++) {
        if (typeof y[j] == "undefined") {
            result.added.push(b[j]);
        }
    }
    return result;
}

function telegram(body) {
    console.log(body);
    var url = "https://api.telegram.org/bot" + config.telegram.botID + "/sendMessage?chat_id=" + config.telegram.chatID + "&text=" + encodeURIComponent(body);
    https.get(url);
}


//Read
try {
    current.lastModuleStatus = JSON.parse(fs.readFileSync(config.storePath, 'utf8'));
} catch (e) {}


function monitor() {
    //Query current
    for (var i = 0; i < config.modules.length; i++) {
        try {
            current.currentModuleStatus[i] = config.modules[i].func();
        } catch (e) {}
        current.differents[i] = compareArray(current.lastModuleStatus[i], current.currentModuleStatus[i]);
    }

    //Notify
    for (var k = 0; k < config.modules.length; k++) {
        if (current.differents[k].added.length > 0 || current.differents[k].deleted.length > 0) {
            for (var i = 0; i < current.differents[k].added.length; i++) {
                var msg = config.modules[k].addMsg;
                for (var key in current.differents[k].added[i]) {
                    if (typeof current.differents[k].added[i][key] !== 'function' && current.differents[k].added[i].hasOwnProperty(key)) {
                        msg = msg.replace(new RegExp("\\{\\[" + key + "\\]\\}", "g"), current.differents[k].added[i][key]);
                    }
                }
                telegram(config.hostname + ": " + msg);
            }
            for (var i = 0; i < current.differents[k].deleted.length; i++) {
                var msg = config.modules[k].delMsg;
                for (var key in current.differents[k].deleted[i]) {
                    if (typeof current.differents[k].deleted[i][key] !== 'function' && current.differents[k].deleted[i].hasOwnProperty(key)) {
                        msg = msg.replace(new RegExp("\\{\\[" + key + "\\]\\}", "g"), current.differents[k].deleted[i][key]);
                    }
                }
                telegram(config.hostname + ": " + msg);
            }
        }
    }


    //Write
    fs.writeFile(config.storePath, JSON.stringify(current.currentModuleStatus), function (err) {
        if (err) {
            return console.log(err);
        }
    });

    current.lastModuleStatus = current.currentModuleStatus;
    current.currentModuleStatus = [];
    console.log("Cycling...");

    require('child_process').execSync("sleep 5");

}

setInterval(monitor, 5000);
