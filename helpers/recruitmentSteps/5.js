module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        userData.steamUsername = userData.response;

        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: storage.getItem('settings').recruitmentCopy.step5Response.replace(/\\n/g, "\n").replace("{steamName}", userData.steamUsername),
                thing_id: userData.fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}