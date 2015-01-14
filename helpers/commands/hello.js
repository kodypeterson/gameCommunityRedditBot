module.exports = function(fullname, args){
    return new Promise(function (resolve, reject) {
        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: 'Hi! You are looking mighty beautifly today!',
                thing_id: fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}