/* Send Intro To New Recruit Message
*/
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    request = Promise.promisify(require("request")),
    scRequest = null,
    cookieJar = require('request').jar(),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 3;

jobs.process(JOB_TYPES.gtaCrewInvite, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.user, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            var gamertag = job.data.user;
            if (recruitData !== null) {
                gamertag = (recruitData.xbox ? recruitData.xboxGamertag : recruitData.psnGamertag);
            }
            // So, first we attempt to get there socialclub
            // username via a search for there gamertag
            scRequest = Promise.promisify(require("request"));
            require('../helpers/socialClub/login')(scRequest, cookieJar).then(function(){
                return require('../helpers/socialClub/getToken')(scRequest, cookieJar, 'http://socialclub.rockstargames.com/member/redditenforcers');
            }).then(function(token){
                return scRequest('http://socialclub.rockstargames.com/friends/MemberSearch?searchTerm='+gamertag+'&pageIndex=0', {
                    headers: {
                        RequestVerificationToken: token
                    },
                    jar: cookieJar
                });
            }).then(function(contents){
                var body = JSON.parse(contents[1]);
                if (gamertag.toLowerCase() === body.MatchedUsers[0].UserName.toLowerCase()) {
                    if (recruitData === null) {
                        recruitData = {
                            isFake: true
                        };
                    }
                    recruitData.socialClub = body.MatchedUsers[0];
                    if (!recruitData.isFake) {
                        jobs.client.set(
                            'reb:recruit:' + job.data.user,
                            JSON.stringify(recruitData), 
                            function(err, res){
                            }
                        );
                    }
                    return require('../helpers/socialClub/getToken')(scRequest, cookieJar, 'http://socialclub.rockstargames.com/member/redditenforcers');
                } else {
                    // We were unable to locate
                    // this users socialClub username.
                    // Notify the recruitment team
                    if (recruitData !== null) {
                        var recruiters = settings.bot.recruitmentApproval;
                        for(var i in recruiters){
                            jobs
                                .create(
                                    JOB_TYPES.sendMessage,
                                    {
                                        title: 'Recruitment Team Alert For ' + job.data.user + ' - Can\'t Send GTA Crew Invite',
                                        body: 'I have attempted to send a crew invite but was unsuccessful.\n\nPlease do so manually for the following user:\n\nReddit Username: ' + job.data.user + '\n\nXbox Gamertag: ' + (recruitData.xbox ? recruitData.xboxGamertag : 'N/A') + '\n\nPSN Gamertag: ' + (recruitData.psn ? recruitData.psnGamertag : 'N/A') + settings.generalCopy.botFooter.replace(/\\n/g, "\n"),
                                        subject: 'Unable To Send Crew Invite For ' + job.data.user,
                                        to: (REDDIT_CONFIG.login.username === 'RedditEnforcersTest') ? 'kpkody' : recruiters[i]
                                    }
                                )
                                .priority(JOB_PARAMS.sendMessage.priority)
                                .save();
                        }
                    }
                    done();
                }
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
                        rockstarId: recruitData.socialClub.RockstarId,
                        role: 4
                    },
                    jar: cookieJar
                });
            }).then(function(resp){
                var body = resp[1];
                if (body.Status) {
                    // Everything was a success!
                    // Send User GTA Online Rules
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: 'Send GTA Online Rules',
                                body: settings.infoAndCopy.gtaOnlineRules.replace(/\\n/g, "\n"),
                                subject: 'Reddit Enforcers - GTA Online Crew Rules',
                                to: job.data.user
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                } else {
                    // An Error Happened. Notify the recruitment team
                    if (recruitData !== null) {
                        var recruiters = settings.bot.recruitmentApproval;
                        for(var i in recruiters){
                            jobs
                                .create(
                                    JOB_TYPES.sendMessage,
                                    {
                                        title: 'Recruitment Team Alert For ' + job.data.user + ' - Can\'t Send GTA Crew Invite',
                                        body: 'I have attempted to send a crew invite but was unsuccessful.\n\nROCKSTAR ERROR: ' + body.ErrorText + '\n\nPlease do so manually for the following user:\n\nReddit Username: ' + job.data.user + '\n\nXbox Gamertag: ' + (recruitData.xbox ? recruitData.xboxGamertag : 'N/A') + '\n\nPSN Gamertag: ' + (recruitData.psn ? recruitData.psnGamertag : 'N/A') + settings.generalCopy.botFooter.replace(/\\n/g, "\n"),
                                        subject: 'Unable To Send Crew Invite For ' + job.data.user,
                                        to: (REDDIT_CONFIG.login.username === 'RedditEnforcersTest') ? 'kpkody' : recruiters[i]
                                    }
                                )
                                .priority(JOB_PARAMS.sendMessage.priority)
                                .save();
                        }
                    }
                }
                done(0);
            });
        });
    });
});