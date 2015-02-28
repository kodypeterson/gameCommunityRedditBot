var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 1;

jobs.process(JOB_TYPES.recruitmentTeamResponse, function(job, done){
    var recruit = job.data.data.subject.split('[')[1].split(']')[0];
    jobs.client.get('reb:recruit:' + recruit, function(err, recruitData){
        recruitData = JSON.parse(recruitData);
        jobs.client.get('reb:settings', function(err, settings){
            settings = JSON.parse(settings);
            var userResp = job.data.data.body.replace(/\n/g, '').toLowerCase().replace('.', '');
            if (recruitData === null) {
                // Invalid recruit
                jobs
                    .create(
                        JOB_TYPES.sendMessage,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            reply: job.data.data.name,
                            body: 'The recruit \'' + recruit + '\' username is not valid',
                            markRead: true
                        }
                    )
                    .priority(JOB_PARAMS.sendMessage.priority)
                    .save();
            } else if (recruitData.currentStep !== 'awaitingApproval') {
                // Recruit Already Approved/Rejected
                jobs
                    .create(
                        JOB_TYPES.sendMessage,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            reply: job.data.data.name,
                            body: settings.recruitmentCopy.recruiterAlreadyCompleteResponse.replace(/\\n/g, "\n"),
                            markRead: true
                        }
                    )
                    .priority(JOB_PARAMS.sendMessage.priority)
                    .save();
            } else if (userResp === 'approved') {
                // Recruit Approved
                jobs
                    .create(
                        JOB_TYPES.sendMessage,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            reply: job.data.data.name,
                            body: settings.recruitmentCopy.recruiterResponse.replace(/\\n/g, "\n"),
                            markRead: true
                        }
                    )
                    .priority(JOB_PARAMS.sendMessage.priority)
                    .save();
                jobs
                    .create(
                        JOB_TYPES.approveRecruit,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            recruitTeamMember: job.data.data.author,
                            recruit: recruit
                        }
                    )
                    .priority(JOB_PARAMS.approveRecruit.priority)
                    .save();
                var recruiters = settings.bot.recruitmentApproval;
                for(var i in recruiters){
                    if (recruiters[i] !== job.data.data.author) {
                        jobs
                            .create(
                                JOB_TYPES.sendMessage,
                                {
                                    title: 'Recruitment Team Alert For ' + recruit,
                                    body: settings.recruitmentCopy.otherRecruiterResponse.replace('{recruiterUsername}', job.data.data.author).replace('{status}', '**approved**').replace(/\\n/g, "\n"),
                                    subject: 'RESPONDED: New Recruit [' + recruit + ']',
                                    to: (REDDIT_CONFIG.login.username === 'RedditEnforcersTest') ? 'kpkody' : recruiters[i]
                                }
                            )
                            .priority(JOB_PARAMS.sendMessage.priority)
                            .save();
                    }
                }
            } else if (userResp === 'rejected') {
                // Recruit Approved
                jobs
                    .create(
                        JOB_TYPES.sendMessage,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            reply: job.data.data.name,
                            body: settings.recruitmentCopy.recruiterResponse.replace(/\\n/g, "\n"),
                            markRead: true
                        }
                    )
                    .priority(JOB_PARAMS.sendMessage.priority)
                    .save();
                jobs
                    .create(
                        JOB_TYPES.rejectRecruit,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            recruitTeamMember: job.data.data.author,
                            recruit: recruit
                        }
                    )
                    .priority(JOB_PARAMS.rejectRecruit.priority)
                    .save();
                var recruiters = settings.bot.recruitmentApproval;
                for(var i in recruiters){
                    if (recruiters[i] !== job.data.data.author) {
                        jobs
                            .create(
                                JOB_TYPES.sendMessage,
                                {
                                    title: 'Recruitment Team Alert For ' + recruit,
                                    body: settings.recruitmentCopy.otherRecruiterResponse.replace('{recruiterUsername}', job.data.data.author).replace('{status}', '**rejected**').replace(/\\n/g, "\n"),
                                    subject: 'RESPONDED: New Recruit [' + recruit + ']',
                                    to: (REDDIT_CONFIG.login.username === 'RedditEnforcersTest') ? 'kpkody' : recruiters[i]
                                }
                            )
                            .priority(JOB_PARAMS.sendMessage.priority)
                            .save();
                    }
                }
            } else {
                // The message was not 'Approved' or 'Rejected'
                jobs
                    .create(
                        JOB_TYPES.sendMessage,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            reply: job.data.data.name,
                            body: 'Your Response: ' + '\n-------\n' + userResp + '\n-------\n' + settings.recruitmentCopy.invalidRecruiterResponse.replace(/\\n/g, "\n"),
                            markRead: true
                        }
                    )
                    .priority(JOB_PARAMS.sendMessage.priority)
                    .save();
            }
            done();
        });
    });
});