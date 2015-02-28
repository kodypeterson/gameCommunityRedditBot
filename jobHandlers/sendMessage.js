/* Sends a message to a user via Reddit */
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 2;

jobs.process(JOB_TYPES.sendMessage, function(job, done){
    job.log('Logging In To Reddit');
    reddit.login().then(function(){
        progress(job, jobSteps, 'Login Complete');
        job.log('Sending Message');
        var postData = {
            api_type: 'json',
            text: job.data.body
        };
        if (job.data.reply) {
            postData.thing_id = job.data.reply;
            return reddit('/api/comment').post(postData);
        } else {
            postData.to = job.data.to;
            postData.subject = job.data.subject;
            if (REDDIT_CONFIG.login.username === 'RedditEnforcersTest') {
                // The test bot can not send messages direct
                // resolve the promise right away
                return new Promise(function (resolve, reject) {
                    resolve();
                });
            }
            return reddit('/api/compose').post(postData);
        }
    }).then(function(){
        progress(job, jobSteps, 'Message Sent!');
        if (job.data.markRead) {
            jobs
                .create(
                    JOB_TYPES.markMessageRead,
                    {
                        title: job.data.title,
                        thing_id: job.data.reply
                    }
                )
                .priority(JOB_PARAMS.markMessageRead.priority)
                .save();
        }
        done();
    });
});