/* Get The Latest Bot Settings From Reddit Wiki
*/
var kue = require('kue'),
    Snoocore = require('snoocore'),
    _ = require('lodash'),
    ini = require('ini'),
    Promise = require('bluebird'),
    reddit = new Snoocore(REDDIT_CONFIG),
    jobs = kue.createQueue(),
    progress = require('../helpers/progress'),
    jobSteps = 1;

jobs.process(JOB_TYPES.getSettings, function(job, done){
    var settings = {};
    var settingPlaces = [
        "recruitsettings",
        "infoandcopy"
    ];
    jobSteps = settingPlaces.length + 2;
    job.log('Logging In To Reddit');
    reddit.login().then(function(){
        progress(job, jobSteps, 'Login Complete');
        job.log('Getting Bot Settings');
        return reddit.raw('http://api.reddit.com/r/$subreddit/wiki/botsettings.json').get({
            $subreddit: 'Reddit_Enforcers'
        })
    }).then(function(sets){
        progress(job, jobSteps, 'Getting Bot Settings Complete!');
        return setSettings(sets);
    }).then(function(){
        return Promise.map(settingPlaces, function(setting){
            progress(job, jobSteps, 'Getting ' + setting);
            return reddit.raw('http://api.reddit.com/r/$subreddit/wiki/' + setting + '.json').get({
                $subreddit: 'Reddit_Enforcers'
            }).then(function(sets){
                progress(job, jobSteps, 'Getting ' + setting + ' Complete!');
                return setSettings(sets);
            })
        }, {
            concurrency: 1
        });
    }).then(function(){
        jobs.client.set('reb:settings', JSON.stringify(settings), function(err, res){
            require('../helpers/reCreateJob')(job);
            done();
        });
    });

    var setSettings = function(sets){
        return new Promise(function (resolve, reject) {
            if(sets.data !== undefined){
                if(settings.generalCopy !== undefined){
                    sets.data.content_md = sets.data.content_md.replace(/\{botFooter\}/g, settings.generalCopy.botFooter);
                }
                sets = ini.parse(sets.data.content_md);
                settings = _.extend(sets, settings);
                resolve();
            } else {
                reject();
            }
        });
    }
});