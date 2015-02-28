require('./constants');

var kue = require('kue'),
    _ = require('lodash'),
    jobs = kue.createQueue();

// Start the kue UI
kue.app.listen(3000);

// Re-Queue Active Jobs
jobs.active(function(err, jobIds){
    _.forEach(jobIds, function(jobId){
        kue.Job.get(jobId, function (err, job) {
            if (err) return;
            job.log('RESTARTING JOB - APP RESTART');
            job.inactive();
        });
    });
})

// Only start startup tasks if one does
// not already exist
_.forEach(CONFIG.startupTasks, function(task){
    jobs.cardByType(JOB_TYPES[task], 'delayed', function(err, count){
        if (count > 0) return;
        jobs.cardByType(JOB_TYPES[task], 'active', function(err, count){
            if (count > 0) return;
            jobs.cardByType(JOB_TYPES[task], 'inactive', function(err, count){
                if (count === 0) {
                    jobs
                        .create(
                            JOB_TYPES[task],
                            JOB_PARAMS[task]
                        )
                        .delay(CONFIG[task + 'Delay'] || 10000)
                        .removeOnComplete(true)
                        .priority('low')
                        .save();
                }
            });
        });
    });
});

// Register the job handlers
for (var i in JOB_TYPES) {
    require('./jobHandlers/' + JOB_TYPES[i]);
}

// Make sure kue is promoting delayed jobs
jobs.promote();