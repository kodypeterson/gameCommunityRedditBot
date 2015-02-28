var Promise = require('bluebird');

module.exports = function(request, cookieJar){
    return new Promise(function (resolve, reject) {
        // Send Community Rules
        console.log("                   - Logging Into Social Club");
        require('./getToken')(request, cookieJar).then(function(token){
            return request('https://socialclub.rockstargames.com/profile/signincompact', {
                method: "POST",
                timeout: (8*1000),
                json: {
                    'login': SOCIALCLUB_CONFIG.login.username,
                    'password': SOCIALCLUB_CONFIG.login.password,
                    '__RequestVerificationToken': token,
                    'rememberme': false
                },
                jar: cookieJar
            })
        }).then(function(contents){
            resolve(request);
        });
    });
};