var Promise = require('bluebird');

module.exports = function(request, cookieJar, url){
    return new Promise(function (resolve, reject) {
        // Send Community Rules
        console.log("                   - Getting Social Club Token");
        var extractToken = function(data){
            if(data === undefined) return "";
            var temp = data.split('name="__RequestVerificationToken" type="hidden" value="');
            var __RequestVerificationToken = temp[1].split('"');
            return __RequestVerificationToken[0];
        };

        request((url === undefined ? "https://socialclub.rockstargames.com/": url), {
            timeout: (8*1000),
            jar: cookieJar
        }).then(function(contents){
            var body = contents[1];
            var token = extractToken(body);
            resolve(token);
        });
    });
};