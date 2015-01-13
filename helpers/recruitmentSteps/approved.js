module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        console.log("           - Running Approval Steps");
        // Now we need to send some info and invite to certain groups
        // Also, need to add flair

        // Send Minecraft Info
        require('./approvalSteps/flair')(userData).then(function(){
           return require('./approvalSteps/communityRules')(userData)
        }).then(function(){
            return require('./approvalSteps/minecraft')(userData)
        }).then(function(){
            return require('./approvalSteps/gtaOnline')(userData)
        }).then(resolve);
    });
};