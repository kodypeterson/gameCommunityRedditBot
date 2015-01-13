module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        // Send GTAO Invite
        var xAuth = "05e342b7e91e72a93656a382b235591101e28fb7";
        var request = Promise.promisify(require("request"));
        var scRequest = null;
        var cookieJar = require('request').jar();

        if(userData.xbox || userData.psn){
            var gamerTag = (userData.xbox ? userData.xboxGamerTag : userData.psnGamerTag);
            scRequest = Promise.promisify(require("request"));
            require('../../socialClub/login')(scRequest, cookieJar).then(function(){
                return require('../../socialClub/getToken')(scRequest, cookieJar, 'http://socialclub.rockstargames.com/member/redditenforcers');
            }).then(function(token){
                return scRequest('http://socialclub.rockstargames.com/friends/MemberSearch?searchTerm='+gamerTag+'&pageIndex=0', {
                    headers: {
                        RequestVerificationToken: token
                    },
                    jar: cookieJar
                });
            }).then(function(contents){
                var body = JSON.parse(contents[1]);
                if (gamerTag.toLowerCase() === body.MatchedUsers[0].UserName.toLowerCase()) {
                    userData.socialClub = body.MatchedUsers[0];
                    return require('../../socialClub/getToken')(scRequest, cookieJar, 'http://socialclub.rockstargames.com/member/redditenforcers');
                }
                resolve();
            }).then(function(token){
                return scRequest('http://socialclub.rockstargames.com/crewsapi/UpdateCrew', {
                    headers: {
                        RequestVerificationToken: token
                    },
                    method: 'PUT',
                    json:{
                        "__RequestVerificationToken": token,
                        crewId: "14044455",
                        id: 14044455,
                        inviteMsg: "",
                        name: 'Reddit Enforcers',
                        op: 'invite',
                        rockstarId: userData.socialClub.RockstarId,
                        role: 4
                    },
                    jar: cookieJar
                });
            }).then(function(contents){
                resolve();
            });
        }
        resolve();
    });
};