module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        // Send Community Rules
        console.log("               - Sending Community Rules");
        reddit('/api/compose').post({
            api_type: 'json',
            subject: 'Reddit Enforcers - Community Guidelines and Rules',
            text: storage.getItem('settings').infoAndCopy.communityRules.replace(/\\n/g, "\n"),
            to: userData.redditUsername
        }).then(resolve);
    });
};