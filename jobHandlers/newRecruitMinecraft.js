var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 1;

jobs.process(JOB_TYPES.newRecruitMinecraft, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.data.author, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            var minecraftUsername = job.data.data.body.replace(/\n/g, '');
            if (minecraftUsername.toLowerCase() === 'n/a') {
                // This user does not have an xbox gamertag
                recruitData.minecraft = false;
            } else {
                recruitData.minecraft = true;
                recruitData.minecraftUsername = minecraftUsername;
            }
            recruitData.currentStep = 'newRecruitMinecraft';
            job.log('Saving Recruit Data');
            jobs.client.set(
                'reb:recruit:' + job.data.data.author,
                JSON.stringify(recruitData), 
                function(err, res){
                    progress(job, jobSteps, 'Recruit Data Saved Successfully!');
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: job.data.data.name + ' - ' + job.data.data.author,
                                reply: job.data.data.name,
                                body: settings.recruitmentCopy.whoRecruitedResponse.replace(/\\n/g, "\n"),
                                markRead: true
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                    done();
                }
            );
        });
    });
});