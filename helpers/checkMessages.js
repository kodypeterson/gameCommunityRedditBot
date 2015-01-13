module.exports = function(){
    var check = function(){
        console.log('Checking For Messages');
        return new Promise(function (resolve, reject) {
            reddit.login().then(function(){
                return reddit('/message/unread').get();
            }).then(function(messages){
                messages = messages.data.children;
                console.log(messages.length + ' Unread Messages');

                var messageHandler = require('./messageHandler');

                return Promise.map(messages, function(message){
                    return messageHandler(message);
                }, {
                    concurrency: 1
                });
            }).then(function(){
                resolve();
            }).catch(function(error){
                resolve();
            });
        });
    }

    console.log('Refreshing Settings');
    require('./getSettings')().then(function(){
        return check();
    }).then(function(error){
        if(error) throw error;
        // Schedule Next Check
        console.log('Message Handler Complete!');
        setTimeout(checkMessages, 5000);
    }).catch(function(error){
        if(error) throw error;
        // Schedule Next Check
        console.log('Message Handler Complete!');
        setTimeout(checkMessages, 5000);
    });
}