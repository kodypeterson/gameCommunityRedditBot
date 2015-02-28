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

jobs.process(JOB_TYPES.flairUpdate, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.user, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            // Send The Notification To The User
            var flair = [];
            if (settings.bot.moderators.indexOf(job.data.user) !== -1) {
                // This user is a moderator
                flair.push('Moderator');
            }
            if (recruitData !== null) {
                if (recruitData.steam) flair.push('Steam');
                if (recruitData.xbox) flair.push('Xbox: ' + recruitData.xboxGamertag);
                if (recruitData.psn ) flair.push('PSN: ' + recruitData.psnGamertag);
                if (recruitData.minecraft) flair.push('Minecraft');
            }
            job.log('Login To Reddit');
            reddit.login().then(function(){
                job.log('Login Complete');
                job.log('Update Flair To: ' + flair.join(','));
                return reddit('/r/$subreddit/api/flair').post({
                    $subreddit: 'Reddit_Enforcers',
                    api_type: 'json',
                    name: job.data.user,
                    text: flair.join(', ')
                });
            }).then(function(){
                job.log('Flair Updated');
                done();
            });
        });
    });
});