var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 1;

jobs.process(JOB_TYPES.deleteRecruit, function(job, done){
    jobs.client.get('reb:recruit:' + job.data.data.body, function(err, recruitData){
        if (recruitData === null) {
            jobs
                .create(
                    JOB_TYPES.sendMessage,
                    {
                        title: job.data.data.name + ' - ' + job.data.data.author,
                        reply: job.data.data.name,
                        body: 'Invalid recruit reddit username: ' + job.data.data.body,
                        markRead: true
                    }
                )
                .priority(JOB_PARAMS.sendMessage.priority)
                .save();
            done();
        } else {
            jobs.client.del('reb:recruit:' + job.data.data.body, function(err){
                jobs
                    .create(
                        JOB_TYPES.sendMessage,
                        {
                            title: job.data.data.name + ' - ' + job.data.data.author,
                            reply: job.data.data.name,
                            body: 'Recruit \'' + job.data.data.body + '\' Deleted',
                            markRead: true
                        }
                    )
                    .priority(JOB_PARAMS.sendMessage.priority)
                    .save();
                done();
            });
        }
    });
});