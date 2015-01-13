module.exports = function(){
    return new Promise(function (resolve, reject) {
        // resolve();
        // return true;

        var ini = require('ini');
        var merge = require('merge');
        var settings = {};

        console.log('    - botsettings');
        reddit.login().then(function(){
            return reddit.raw('http://api.reddit.com/r/$subreddit/wiki/botsettings.json').get({
                $subreddit: 'Reddit_Enforcers'
            })
        }).then(function(sets){
            return setSettings(sets);
        }).then(function(){
            var settings = [
                "recruitsettings",
                "infoandcopy"
            ];

            return Promise.map(settings, function(setting){
                console.log('    - ' + setting);
                return reddit.raw('http://api.reddit.com/r/$subreddit/wiki/' + setting + '.json').get({
                    $subreddit: 'Reddit_Enforcers'
                }).then(function(sets){
                    return setSettings(sets);
                })
            }, {
                concurrency: 1
            });
        }).then(function(){
            storage.setItem('settings', settings);
            resolve();
        });

        var setSettings = function(sets){
            return new Promise(function (resolve, reject) {
                if(sets.data !== undefined){
                    if(settings.generalCopy !== undefined){
                        sets.data.content_md = sets.data.content_md.replace(/\{botFooter\}/g, settings.generalCopy.botFooter);
                    }
                    sets = ini.parse(sets.data.content_md);
                    settings = merge(sets, settings);
                    resolve();
                } else {
                    reject();
                }
            });
        }
    });
}