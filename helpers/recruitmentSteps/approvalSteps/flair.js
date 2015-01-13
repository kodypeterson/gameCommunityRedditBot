module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        // Send Community Rules
        console.log("               - Adding User Flair");
        var flair = [];
        if (storage.getItem('settings').bot.moderators.indexOf(userData.redditUsername) > -1) {
            flair.push('Moderator');
        }
        if (userData.steam) {
            flair.push('Steam');
        }
        if (userData.xbox) {
            flair.push('Xbox');
        }
        if (userData.psn) {
            flair.push('PSN');
        }
        if (userData.minecraft) {
            flair.push('Minecraft');
        }
        reddit('/r/$subreddit/api/flair').post({
            $subreddit: 'Reddit_Enforcers',
            api_type: 'json',
            name: userData.redditUsername,
            text: flair.join(', ')
        }).then(resolve);
    });
};