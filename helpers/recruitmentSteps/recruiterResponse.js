module.exports = function(userData){
    return new Promise(function (resolve, reject) {
        reddit.login().then(function(){
            if(userData === undefined || userData.approved !== undefined){
                // This user has already been taken care of
                console.log("       - Already Responded");
                console.log("           - Sending Recruiter Response");
                reddit('/api/comment').post({
                    api_type: 'json',
                    text: storage.getItem('settings').recruitmentCopy.recruiterAlreadyCompleteResponse.replace(/\\n/g, "\n"),
                    thing_id: userData.fullname
                }).then(function(response){
                    resolve();
                });
            }else if (userData.response.toLowerCase() === 'approved') {
                // The user was approved
                console.log("       - Approved");
                console.log("           - Sending Recruiter Response");
                reddit('/api/comment').post({
                    api_type: 'json',
                    text: storage.getItem('settings').recruitmentCopy.recruiterResponse.replace(/\\n/g, "\n"),
                    thing_id: userData.fullname
                }).then(function(){
                    return reddit.login();
                }).then(function(){
                    console.log("           - Sending User Notification Response");
                    return reddit('/api/compose').post({
                        api_type: 'json',
                        subject: 'Reddit Enforcers Gaming Community Membership Response',
                        text: storage.getItem('settings').recruitmentCopy.approvalResponse.replace(/\\n/g, "\n"),
                        to: userData.redditUsername
                    });
                }).then(function(response){
                    userData.approved = true;
                    storage.setItem('user-' + userData.redditUsername, userData);
                    return require('./approved')(userData);
                }).then(function(){
                    resolve();
                });
            } else if (userData.response.toLowerCase() === 'rejected') {
                // The user was rejected
                console.log("       - Rejected");
                console.log("           - Sending Recruiter Response");
                reddit('/api/comment').post({
                    api_type: 'json',
                    text: storage.getItem('settings').recruitmentCopy.recruiterResponse.replace(/\\n/g, "\n"),
                    thing_id: userData.fullname
                }).then(function(){
                    return reddit.login();
                }).then(function(){
                    console.log("           - Sending User Notification Response");
                    return reddit('/api/compose').post({
                        api_type: 'json',
                        subject: 'Reddit Enforcers Gaming Community Membership Response',
                        text: storage.getItem('settings').recruitmentCopy.rejectedResponse.replace(/\\n/g, "\n"),
                        to: userData.redditUsername
                    });
                }).then(function(response){
                    storage.removeItem('user-' + userData.redditUsername);
                    resolve();
                });
            } else {
                // The recruiter responded with something we have no idea
                console.log("       - Invalid Response");
                console.log("           - Sending Recruiter Response");
                reddit('/api/comment').post({
                    api_type: 'json',
                    text: storage.getItem('settings').recruitmentCopy.invalidRecruiterResponse.replace(/\\n/g, "\n"),
                    thing_id: userData.fullname
                }).then(function(response){
                    resolve();
                });
            }
        })
    });
}