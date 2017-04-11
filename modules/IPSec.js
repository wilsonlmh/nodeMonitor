module.exports = function () {
    var execSync = require('child_process').execSync;
    var leases = execSync("/usr/local/sbin/ipsec leases").toString('utf8');
    var status = execSync("/usr/local/sbin/ipsec status").toString('utf8');
    var regex = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})[\s]+(offline|online)[\s]+\'(.*)\'/gi;

    var result = [];

    while (matches = regex.exec(leases)) {
        var tunnelIp = matches[1];
        var state = matches[2];
        var user = matches[3];

        if (state == "online") {
            var remoteIp = ((new RegExp('android\\_xauth\\_psk[\\[\\{][0-9]*[\\]\\}]\\:[\\s]*ESTABLISHED(.*)ago\\,[\\s]*[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\]\\.\\.\\.([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3})\\[(.*)\\]\\nandroid\\_xauth\\_psk(.*)\\nandroid\\_xauth\\_psk[\\[\\{][0-9]*[\\]\\}]\\:[\\s]*0\\.0\\.0\\.0\\\/0\\s\\=\\=\\=\\s' + tunnelIp.replace(/\./g, "\\."))).exec(status) || [])[2];
            var remoteIp = remoteIp || ((new RegExp('ios_ikev2[\\[\\{\\d\\}\\]]+\\:\\sESTABLISHED.*\\.\\.\\.([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}).*\\n[\\s]*ios_ikev2[\\[\\{\\d\\}\\]]+\\:.*\\n[\\s]*ios_ikev2[\\[\\{\\d\\}\\]]+\\:[\\s]+.*\\=\\=\\=\\s'+tunnelIp.replace(/\./g, "\\."))).exec(status) || [])[1];
            result.push({
                "tunnelIp": tunnelIp,
                "user": user,
                "remoteIp": remoteIp
            });
        }
    }
    return result;
}
