/* Marks A Reddit Message As Read */
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 2;

jobs.process(JOB_TYPES.markMessageRead, function(job, done){
    reddit.login().then(function(){
        progress(job, jobSteps, 'Login Complete');
        job.log('Marking Message As Read');
        return reddit('/api/read_message').post({
            id: job.data.thing_id,
            api_type: 'json'
        });
    }).then(function(){
        progress(job, jobSteps, 'Message Marked As Read');
        done();
    });
});