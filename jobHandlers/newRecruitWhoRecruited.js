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

jobs.process(JOB_TYPES.newRecruitWhoRecruited, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.data.author, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            job.log('Saving Recruit Data');
            recruitData.whoRecruited = job.data.data.body;
            recruitData.currentStep = 'awaitingApproval';
            jobs.client.set(
                'reb:recruit:' + job.data.data.author,
                JSON.stringify(recruitData), 
                function(err, res){
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: job.data.data.name + ' - ' + job.data.data.author,
                                reply: job.data.data.name,
                                body: settings.recruitmentCopy.step6Response.replace(/\\n/g, "\n"),
                                markRead: true
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                    jobs
                        .create(
                            JOB_TYPES.sendToRecruitmentTeam,
                            {
                                title: job.data.data.name + ' - ' + job.data.data.author,
                                user: job.data.data.author
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