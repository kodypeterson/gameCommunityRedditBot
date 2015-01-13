module.exports = function(fullname, args){
    return new Promise(function (resolve, reject) {
        var userData = storage.getItem('user-' + args);
        var text = 'Recruitment Status For \'' + args + '\'';
        text += '\n------';
        if (userData !== undefined) {
            if (userData.approved) {
                text += '\n\nAPPROVED!';
            } else if(userData.step === 6) {
                text += '\n\nAwaiting Recruitment Team Response!';
            } else {
                text += '\n\nAwaiting Repsonse For Step ' + userData.step;
            }
        } else {
            text += '\n\nThis reddit user has not yet started the recruitment process or was rejected!';
        }
        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: text,
                thing_id: fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}