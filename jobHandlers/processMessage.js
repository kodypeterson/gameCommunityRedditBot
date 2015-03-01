/* Process messages from Reddit
*/
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 1;

jobs.process(JOB_TYPES.processMessage, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.data.author, function(err, data){
        var called = false;
        var secruityViolation = false;
        _.forEach(MESSAGE_PROCESSORS, function(value){
            var isValid = true;
            if (value.subject && job.data.data.subject.indexOf(value.subject) !== 0) isValid = false;
            if (value.body && job.data.data.body !== value.body) isValid = false;
            if (isValid && value.allowedAuthors && value.allowedAuthors.indexOf(job.data.data.author) === -1) {
                isValid = false;
                secruityViolation = true;
                return false;
            }
            if (isValid) {
                var processor = value.processor;
                if (processor === 'recruitDynamic') processor = recruitDynamic(job, data);
                job.log('Kicking Off Message Processor: ' + processor);
                if (JOB_TYPES[processor] !== undefined) {
                    called = true;
                    jobs
                        .create(
                            JOB_TYPES[processor],
                            _.omit(_.extend(JOB_PARAMS[processor] || {}, job.data), 'priority')
                        )
                        .priority(_.result(JOB_PARAMS[processor], 'priority') || job._priority)
                        .save();
                    done();
                    return false;
                } else {
                    console.log('PROCESSOR \'' + processor + '\' NOT IN CONSTANTS');
                    job.log('PROCESSOR \'' + processor + '\' NOT IN CONSTANTS');
                    return false;
                }
            }
        });
        if (!called) {
            jobs.client.get('reb:settings', function(err, settings){
                settings = JSON.parse(settings);
                if (secruityViolation) {
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: job.data.data.name + ' - ' + job.data.data.author,
                                reply: job.data.data.name,
                                body: settings.infoAndCopy.securityViolationUser.replace(/\\n/g, "\n"),
                                markRead: true
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: 'Security Violation Mod Messge',
                                to: '/r/reddit_enforcers',
                                subject: 'Reddit Enforcers Bot Security Violation Detected!',
                                body: settings.infoAndCopy.securityViolationMods.replace(/\\n/g, "\n").replace('{user}', job.data.data.author).replace('{command}', job.data.data.subject)
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                    done();
                } else {
                    jobs
                        .create(
                            JOB_TYPES.sendMessage,
                            {
                                title: job.data.data.name + ' - ' + job.data.data.author,
                                reply: job.data.data.name,
                                body: settings.infoAndCopy.invalidCommand.replace(/\\n/g, "\n"),
                                markRead: true
                            }
                        )
                        .priority(JOB_PARAMS.sendMessage.priority)
                        .save();
                    done();
                }
            });
        }
    });
});

function recruitDynamic(job, data){
    if (data === null) {
        return 'newRecruitIntro';
    } else {
        data = JSON.parse(data);
        if (data.currentStep === 'awaitingApproval') {
            return data.currentStep;
        }
        return CONFIG.recruitSteps[CONFIG.recruitSteps.indexOf(data.currentStep) + 1];
    }
}