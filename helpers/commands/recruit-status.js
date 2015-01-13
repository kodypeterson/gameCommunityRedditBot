module.exports = function(fullname, arguments){
    return new Promise(function (resolve, reject) {
        reddit.login().then(function(){
            return reddit('/api/comment').post({
                api_type: 'json',
                text: arguments,
                thing_id: fullname
            });
        }).then(function(response){
            resolve();
        });
    });
}