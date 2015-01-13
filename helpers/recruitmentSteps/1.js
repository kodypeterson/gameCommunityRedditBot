module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: storage.getItem('settings').recruitmentCopy.welcome.replace(/\\n/g, "\n"),
                thing_id: userData.fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}