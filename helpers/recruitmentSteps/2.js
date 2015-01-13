module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        var response = storage.getItem('settings').recruitmentCopy.step2ResponseYes;
        if (userData.response.toLowerCase() === 'n/a') {
            // The user does not have and xbox gamertag
            userData.xbox = false;
            response = storage.getItem('settings').recruitmentCopy.step2ResponseNo;
        } else {
            userData.xbox = true;
            userData.xboxGamerTag = userData.response;
        }

        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: response.replace(/\\n/g, "\n").replace("{xboxGamerTag}", userData.xboxGamerTag),
                thing_id: userData.fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}