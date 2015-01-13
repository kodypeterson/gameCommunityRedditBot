module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        // Send Minecraft Info
        if(userData.minecraft){
            console.log("               - Adding To Whitelist");
            var request = Promise.promisify(require("request"));
            var data = [
                {
                    "name":"players.name.whitelist",
                    "key":"",
                    "username":"redditenforcers",
                    "arguments":[userData.minecraftUsername]
                }
            ];
            data[0].key = require('crypto').createHash('sha256').update(data[0].username+data[0].name+"Reddit101").digest("hex");
            return request("http://185.56.136.208:26537/api/2/call?json=" + encodeURIComponent(JSON.stringify(data))).then(function(contents){
                console.log("               - Sending Minecraft Info");
                return reddit('/api/compose').post({
                    api_type: 'json',
                    subject: 'Reddit Enforcers - Minecraft Server Information',
                    text: storage.getItem('settings').infoAndCopy.minecraftInfo.replace(/\\n/g, "\n"),
                    to: userData.redditUsername
                })
            }).then(resolve);
        }
        resolve();
    });
};