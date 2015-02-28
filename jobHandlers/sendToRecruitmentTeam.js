/* Send Intro To New Recruit Message
*/
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 3;

jobs.process(JOB_TYPES.sendToRecruitmentTeam, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.user, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            job.log('Logging In To Reddit');
            reddit.login().then(function(){
                progress(job, jobSteps, 'Login Complete');
                job.log('Getting Users Reddit Info');
                return reddit('/user/$username/about.json').get({
                    $username: job.data.user
                });
            }).then(function(redditInfo){
                progress(job, jobSteps, 'Retrieved Reddit Info');
                recruitData.redditDetails = redditInfo.data;
                recruitData.redditDetails.accountAge = 0;
                var currentUTC = new Date().getTime();
                var difference = currentUTC - recruitData.redditDetails.created_utc*1000;
                recruitData.redditDetails.accountAge = Math.floor(difference/1000/60/60/24);

                var text = 'Here is the information regarding ' + job.data.user;
                text += '\n\nReddit Account Age: ' + recruitData.redditDetails.accountAge;
                text += '\n\nReddit Account Karma (link/comment): ' + recruitData.redditDetails.link_karma + '/' + recruitData.redditDetails.comment_karma;
                if (recruitData.xbox) {
                    text += '\n\nXbox Gamertag: ' + recruitData.xboxGamertag;
                }
                if (recruitData.psn) {
                    text += '\n\nPSN ID: ' + recruitData.psnGamertag;
                }
                if (recruitData.steam) {
                    text += '\n\nSteam Username: ' + recruitData.steamUsername;
                }
                if (recruitData.minecraft) {
                    text += '\n\nMinecraft Username: ' + recruitData.minecraftUsername;
                }
                text += '\n\nHow They Got Here: ' + recruitData.whoRecruited;
                text += '\n\n-----\n\nTo approve this user, respond \"Approved\". To reject this user, respond \"Rejected\".';
                text += settings.generalCopy.botFooter;

                var recruiters = settings.bot.recruitmentApproval;
                for(var i in recruiters){
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: 'Recruitment Team Alert For ' + job.data.user,
                                body: text.replace(/\\n/g, "\n"),
                                subject: 'New Recruit [' + job.data.user + ']',
                                to: (REDDIT_CONFIG.login.username === 'RedditEnforcersTest') ? 'kpkody' : recruiters[i]
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                }
                done();
            })
        });
    });
});