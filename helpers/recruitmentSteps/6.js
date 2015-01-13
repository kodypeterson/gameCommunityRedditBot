module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        if (userData.response.toLowerCase() === 'n/a') {
            // The user does not play minecraft
            userData.minecraft = false;
        } else {
            userData.minecraft = true;
            userData.minecraftUsername = userData.response;
        }
        require('./sendToRecruitmentTeam')(userData).then(function(){
            return reddit.login();
        }).then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: storage.getItem('settings').recruitmentCopy.step6Response.replace(/\\n/g, "\n"),
                thing_id: userData.fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}