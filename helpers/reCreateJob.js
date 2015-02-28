var kue = require('kue'),
    jobs = kue.createQueue();

/*
 * Recreates a job based on the incoming job
 * object
 *
 * {object} job - the kue job
*/
module.exports = function(job){
    jobs
        .create(
            job.type,
            job.data
        )
        .removeOnComplete(job._removeOnComplete)
        .delay(job._delay)
        .priority(job._priority)
        .save();
}