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

jobs.process(JOB_TYPES.approveRecruit, function(job, done){
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
                        body: settings.recruitmentCopy.approvalResponse.replace(/\\n/g, "\n"),
                        subject: 'Reddit Enforcers Gaming Community Membership Response',
                        to: job.data.recruit
                    }
                )
                .priority(JOB_PARAMS.sendMessage.priority)
                .save();
            // Kick off jobs based on responses
            job.log('Kick-Off Flair Update Job');
            jobs
                .create(
                    JOB_TYPES.flairUpdate,
                    _.extend({
                        user: job.data.recruit
                    }, JOB_PARAMS.flairUpdate || {})
                )
                .priority(JOB_PARAMS.flairUpdate.priority)
                .save();
            job.log('Send Community Rules');
            jobs
                .create(
                    JOB_TYPES.sendMessage,
                    {
                        title: 'Send Community Guidelines and Rules',
                        body: settings.infoAndCopy.communityRules.replace(/\\n/g, "\n"),
                        subject: 'Reddit Enforcers - Community Guidelines and Rules',
                        to: job.data.recruit
                    }
                )
                .priority(JOB_PARAMS.sendMessage.priority)
                .save();
            if (recruitData.xbox || recruitData.psn) {
                job.log('Invite To GTA Online Crew');
                jobs
                    .create(
                        JOB_TYPES.gtaCrewInvite,
                        _.extend({
                            user: job.data.recruit
                        }, JOB_PARAMS.gtaCrewInvite || {})
                    )
                    .priority(JOB_PARAMS.gtaCrewInvite.priority)
                    .save();
            }
            recruitData.currentStep = 'Approved';
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