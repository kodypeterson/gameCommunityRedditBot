module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        var response = storage.getItem('settings').recruitmentCopy.step4ResponseYes;
        if (userData.response.toLowerCase() === 'no') {
            // The user does not play on steam
            userData.steam = false;
            userData.step++; //This user will be skipping the steam username step
            response = storage.getItem('settings').recruitmentCopy.step4ResponseNo;
        } else {
            userData.steam = true;
        }

        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: response.replace(/\\n/g, "\n"),
                thing_id: userData.fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}