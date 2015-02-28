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

jobs.process(JOB_TYPES.rejectRecruit, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.recruit, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            // Send The Notification To The User
            job.log('Send Recruit Notification of Decision');
            jobs
                .create(
                    JOB_TYPES.sendMessage,
                    {
                        title: 'Notify Recruit Of Approval',
                        body: settings.recruitmentCopy.rejectedResponse.replace(/\\n/g, "\n"),
                        subject: 'Reddit Enforcers Gaming Community Membership Response',
                        to: job.data.recruit
                    }
                )
                .priority(JOB_PARAMS.sendMessage.priority)
                .save();
            recruitData.currentStep = 'Rejected';
            recruitData.recruitRegComplete = true;
            jobs.client.set(
                'reb:recruit:' + job.data.recruit,
                JSON.stringify(recruitData), 
                function(err, res){
                    done();
                }
            );
        });
    });
});