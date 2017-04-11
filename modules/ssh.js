module.exports = function () {
    var execSync = require('child_process').execSync;
    var w = execSync("/bin/w -i").toString('utf8').split('\n').slice(2).join('\n');
    var regex = /([a-zA-z0-9]+)[\s]+.*[\s]+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})[\s]+([0-9]+\:[0-9]+[AM|PM]*).*\n/g;
    var result = [];

    while (matches = regex.exec(w)) {
        var username = matches[1];
        var remoteIp = matches[2];
        var loginTime = matches[3];

        result.push({
            "username": username,
            "remoteIp": remoteIp,
            "loginTime": loginTime
        });
    }
    return result;
}
