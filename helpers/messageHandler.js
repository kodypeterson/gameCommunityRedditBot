module.exports = function(message){
    console.log("    - Handling Message " + message.data.id);
    return new Promise(function (resolve, reject) {
        switch(message.data.subject){
            case 'New Recruit Registration':
            case 're: New Recruit Registration':
                var userData = storage.getItem('user-' + message.data.author) || {
                    step: 0,
                    redditUsername: message.data.author
                };
                userData.response = message.data.body;
                userData.fullname = message.data.name;
                userData.messageFrom = message.data.author;
                userData.step++;
                console.log("       - Running Recruitment Step " + userData.step);
                require('./recruitmentSteps/' + userData.step)(userData).then(function(){
                    storage.setItem('user-' + message.data.author, userData);
                    console.log("       - Marking Message As Read");
                    return reddit.login();
                }).then(function(){
                    return reddit('/api/read_message').post({
                        id: userData.fullname,
                        api_type: 'json'
                    });
                }).then(resolve);
                break;

            default:
                if (message.data.subject.indexOf('re: New Recruit [') > -1) {
                    // This is a recruiters response to a new recruit
                    var username = message.data.subject.split('[')[1].split(']')[0];
                    var userData = storage.getItem('user-' + username);
                    userData.response = message.data.body;
                    userData.fullname = message.data.name;
                    userData.messageFrom = message.data.author;
                    console.log("       - Running Recruitment Response");
                    require('./recruitmentSteps/recruiterResponse')(userData).then(function(){
                        console.log("       - Marking Message As Read");
                        return reddit.login();
                    }).then(function(){
                        return reddit('/api/read_message').post({
                            id: userData.fullname,
                            api_type: 'json'
                        });
                    }).then(resolve);
                }else{
                    var command = message.data.subject;
                    var fs = require('fs');
                    if (fs.existsSync(__dirname + '/commands/' + command + '.js')) {
                        console.log("       - Running " + command);
                        require('./commands/' + command)(message.data.name, message.data.body, message.data.author).then(function(){
                            console.log("       - Marking Message As Read");
                            return reddit.login();
                        }).then(function(){
                            return reddit('/api/read_message').post({
                                id: message.data.name,
                                api_type: 'json'
                            });
                        }).then(resolve);
                    } else {
                        console.log("       - Invalid Command");
                        reddit.login().then(function(){
                            return reddit('/api/comment').post({
                                api_type: 'json',
                                text: storage.getItem('settings').infoAndCopy.invalidCommand.replace(/\\n/g, "\n"),
                                thing_id: message.data.name
                            })
                        }).then(function(){
                            return reddit.login()
                        }).then(function(){
                            console.log("       - Marking Message As Read");
                            return reddit('/api/read_message').post({
                                id: message.data.name,
                                api_type: 'json'
                            });
                        }).then(resolve);
                    }
                }
                break;
        }
    });
}