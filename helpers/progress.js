/*
 * Increases progress count
 *
 * {object} job - the kue job
 * {integer} steps - the total steps for the job
*/
module.exports = function(job, steps, status){
    var progress = job._progress || 0;
    job.progress(progress + 1, steps);
    if (status) job.log(status);
}