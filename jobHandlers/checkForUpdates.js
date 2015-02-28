/* Gets messages from Reddit
*/
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    semver = require('semver'),
    request = Promise.promisify(require("request")),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 3,
    currentVersion = require('../package.json').version;

jobs.process(JOB_TYPES.checkForUpdates, function(job, done){
    request('https://raw.githubusercontent.com/kodypeterson/reb/master/package.json', {
        method: "GET",
        timeout: (8*1000),
    }).then(function(res){
        var body = JSON.parse(res[1]);
        if (semver.gt(body.version, currentVersion)) {
            // An update is available
            job.log('Update Available');
            job.log('Shutting Down Kue');
            console.log('Update Available');
            console.log('Shutting Down Kue');
            jobs
                .create(
                    JOB_TYPES.sendMessage,
                    {
                        title: 'Update Notification',
                        to: 'kpkody',
                        body: 'I have just updated myself to v' + body.version,
                        subject: 'I Have Updated Myself!'
                    }
                )
                .delay(10000)
                .priority(JOB_PARAMS.sendMessage.priority)
                .save();
            jobs.shutdown(function(err) {
                console.log('Kue Shutdown');
                console.log('Running git pull');
                var exec = require('child_process').exec;
                exec('git fetch --all;git reset --hard origin/master', {
                    cwd: require('path').normalize(__dirname + '/../')
                }, function(){
                    // command complete
                    console.log('Installing Dependencies');
                    exec('npm install', {
                        cwd: require('path').normalize(__dirname + '/../')
                    }, function(){
                        // command complete
                        console.log('Update Complete - Restarting');
                        process.exit(0);     
                    });
                });
            }, 5000 );
        } else {
            job.log('No Update');
            require('../helpers/reCreateJob')(job);
            // done();
        }
    });
});