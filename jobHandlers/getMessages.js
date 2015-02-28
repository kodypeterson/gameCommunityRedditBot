/* Gets messages from Reddit
*/
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 3;

jobs.process(JOB_TYPES.getMessages, function(job, done){
    job.log('Logging In To Reddit');
    reddit.login().then(function(){
        progress(job, jobSteps, 'Login Complete');
        job.log('Getting Unread Messages');
        return reddit('/message/unread').get();
    }).then(function(messages){
        progress(job, jobSteps, 'Get Unread Messages Complete');
        var messages = messages.data.children;
        if (messages.length > 0) {
            // This job we will want to store
            job.log(messages.length + ' Messages Found');
            var promises = [];
            var messageTrueCount = 0;
            _.forEach(messages, function(message){
                var promise = require('../helpers/messageJobStatus')(message.data.name, message)
                    .then(function(data){
                        var status = data[0];
                        var message = data[1];
                        // We only create the job if it the message
                        // is not already being handled 
                        if (status === undefined) {
                            messageTrueCount++;
                            // Set the job title
                            message.title = message.data.name + ' - ' + message.data.author;
                            // Create the job
                            jobs
                                .create(
                                    JOB_TYPES.processMessage,
                                    message
                                )
                                .priority(JOB_PARAMS.processMessage.priority)
                                .save();
                        }
                    });
                promises.push(promise);
            });
            Promise
                .all(promises)
                .then(function(){
                    require('../helpers/reCreateJob')(job);
                    if (messageTrueCount > 0) {
                        job.removeOnComplete(false);
                    }
                    done();
                });
        } else {
            // There are no new messages
            job.log('No New Messages');
            require('../helpers/reCreateJob')(job);
            done();
        }
    }).catch(function(err){
        // An error occurred in the chain
        require('../helpers/reCreateJob')(job);
        done(err);
    });
});