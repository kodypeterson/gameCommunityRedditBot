global.storage = require('node-persist');
var Snoocore = require('snoocore');
global.Promise = require("bluebird");
var info = require('./package.json');
global.reddit = new Snoocore({
    userAgent: 'RedditEnforcerBot v' + info.version + ' by /u/kpkody',
    login:{
        username: 'RedditEnforcers',
        password: 'Reddit101'
    }
});

Promise.promisifyAll(reddit);
global.checkMessages = require('./helpers/checkMessages');

// Initialize The Storage
storage.initSync();

checkMessages();