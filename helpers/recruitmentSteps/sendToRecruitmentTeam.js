module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        reddit.login().then(function(){
            return reddit('/user/$username/about.json').get({
                $username: userData.redditUsername
            });
        }).then(function(redditInfo){
            userData.redditDetails = redditInfo.data;
            userData.redditDetails.accountAge = 0;
            var currentUTC = new Date().getTime();
            var difference = currentUTC - userData.redditDetails.created_utc*1000;
            userData.redditDetails.accountAge = Math.floor(difference/1000/60/60/24);

            var text = 'Here is the information regarding ' + userData.redditUsername;
            text += '\n\nReddit Account Age: ' + userData.redditDetails.accountAge;
            text += '\n\nReddit Account Karma (link/comment): ' + userData.redditDetails.link_karma + '/' + userData.redditDetails.comment_karma;
            if (userData.xbox) {
                text += '\n\nXbox Gamertag: ' + userData.xboxGamerTag;
            }
            if (userData.psn) {
                text += '\n\nPSN ID: ' + userData.psnGamerTag;
            }
            if (userData.steam) {
                text += '\n\nSteam Username: ' + userData.steamUsername;
            }
            if (userData.minecraft) {
                text += '\n\nMinecraft Username: ' + userData.minecraftUsername;
            }
            text += '\n\n-----\n\nTo approve this user, respond \"Approved\". To reject this user, respond \"Rejected\".';
            text += storage.getItem('settings').generalCopy.botFooter;

            var recruiters = storage.getItem('settings').bot.recruitmentApproval;
            console.log("       - Sending Recruiters Info Message");
            var messages = [];
            for(var i in recruiters){
                console.log("           - " + recruiters[i]);
                messages.push(reddit('/api/compose').post({
                    api_type: 'json',
                    subject: 'New Recruit [' + userData.redditUsername + ']',
                    text: text.replace(/\\n/g, "\n"),
                    to: recruiters[i]
                }));
            }
            return Promise.all(messages);
        }).then(resolve);
    });
}