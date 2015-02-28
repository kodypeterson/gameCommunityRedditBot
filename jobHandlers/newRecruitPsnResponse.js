var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 1;

jobs.process(JOB_TYPES.newRecruitPsnResponse, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.data.author, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            var gamerTag = job.data.data.body.replace(/\n/g, '');
            var response = settings.recruitmentCopy.step3ResponseYes;
            if (gamerTag.toLowerCase() === 'n/a') {
                // This user does not have an psn gamertag
                recruitData.psn = false;
                response = settings.recruitmentCopy.step3ResponseNo;
            } else {
                recruitData.psn = true;
                recruitData.psnGamertag = gamerTag;
            }
            recruitData.currentStep = 'newRecruitPsnResponse';
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
                                body: response.replace(/\\n/g, "\n").replace("{psnGamerTag}", recruitData.psnGamertag),
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