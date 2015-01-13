module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        var response = storage.getItem('settings').recruitmentCopy.step3ResponseYes;
        if (userData.response.toLowerCase() === 'n/a') {
            // The user does not have and pns gamertag
            userData.psn = false;
            response = storage.getItem('settings').recruitmentCopy.step3ResponseNo;
        } else {
            userData.psn = true;
            userData.psnGamerTag = userData.response;
        }

        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: response.replace(/\\n/g, "\n").replace("{psnGamerTag}", userData.psnGamerTag),
                thing_id: userData.fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}