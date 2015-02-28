var kue = require('kue'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    jobs = kue.createQueue();

/*
 * Finds the status of a message's job
 * based on message name.
 *
 * {string} name - message name
*/
module.exports = function(name, message){
    return new Promise(function (resolve, reject) {
        doType('inactive', name).then(function(jobInfo){
            if (jobInfo) return resolve([jobInfo._state, message]);
            return doType('active', name);
        }).then(function(jobInfo){
            if (jobInfo) return resolve([jobInfo._state, message]);
            return doType('delayed', name);
        }).then(function(jobInfo){
            if (jobInfo) return resolve([jobInfo._state, message]);
            return resolve([undefined, message]);
        });
    });
}

function handleJobs(j, name) {
    var info = undefined;
    return new Promise(function (resolve, reject) {
        var promises = [];
        _.forEach(j, function(jobId){
            var promise = new Promise(function (res, reject) {
                kue.Job.get(jobId, function (err, job) {
                    if (job.data.title === undefined) {
                        res(undefined);
                    } else if (job.data.title.indexOf(name) !== -1) {
                        res(job);
                    } else {
                        res(undefined);
                    }
                });
            });
            promises.push(promise);
        });
        Promise
            .all(promises)
            .then(function(results){
                _.forEach(results, function(value){
                    if (value !== undefined) {
                        resolve(value);
                    }
                });
                resolve(undefined);
            });
    });
}

function doType(type, name){
    return new Promise(function (resolve, reject) {
        jobs[type](function(err, j){
            handleJobs(j, name).then(resolve);
        });
    });
}