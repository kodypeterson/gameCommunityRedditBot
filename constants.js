global.JOB_TYPES = {
    getMessages: 'getMessages',
    getSettings: 'getSettings',
    processMessage: 'processMessage',
    newRecruitIntro: 'newRecruitIntro',
    newRecruitXboxResponse: 'newRecruitXboxResponse',
    sendMessage: 'sendMessage',
    markMessageRead: 'markMessageRead',
    deleteRecruit: 'deleteRecruit',
    newRecruitPsnResponse: 'newRecruitPsnResponse',
    newRecruitSteamResponse: 'newRecruitSteamResponse',
    newRecruitSteamUsernameResponse: 'newRecruitSteamUsernameResponse',
    newRecruitMinecraft: 'newRecruitMinecraft',
    newRecruitWhoRecruited: 'newRecruitWhoRecruited',
    sendToRecruitmentTeam: 'sendToRecruitmentTeam',
    recruitmentTeamResponse: 'recruitmentTeamResponse',
    approveRecruit: 'approveRecruit',
    rejectRecruit: 'rejectRecruit',
    flairUpdate: 'flairUpdate',
    gtaCrewInvite: 'gtaCrewInvite',
    checkForUpdates: 'checkForUpdates'
}

global.JOB_PARAMS = {
    getMessages: {
        title: 'Gets Reddit Bot Messages From Reddit'
    },
    getSettings: {
        title: 'Gets The Latest Bot Settings From Reddit Wiki'
    },
    checkForUpdates: {
        title: 'Checks If Bot Has Latest Version'
    },
    processMessage: {
        priority: 'high'
    },
    sendMessage: {
        priority: 'critical'
    },
    markMessageRead: {
        priority: 'critical'
    },
    approveRecruit: {
        priority: 'critical'
    },
    rejectRecruit: {
        priority: 'critical'
    },
    flairUpdate: {
        priority: 'high',
        title: 'Sets The Users Flair Based On Stored Data'
    },
    gtaCrewInvite: {
        priority: 'low',
        title: 'Invite The User To The GTA Online Crew'
    }
}

global.REDDIT_CONFIG = {
    userAgent: 'Reddit Enforcers Bot - v' + require('./package.json').version + ' by /u/kpkody',
    login: {
        username: 'RedditEnforcers',
        password: require('./password')
    }
}

global.SOCIALCLUB_CONFIG = {
    login: {
        username: 'RedditEnforcers',
        password: require('./password')
    }
}

global.CONFIG = {
    getMessageDelay: 10000, // milliseconds - 10 seconds
    getSettingsDelay: 300000, //milliseconds - 5 minutes
    checkForUpdatesDelay: 300000, //milliseconds - 5 minutes
    startupTasks: [
        'getMessages',
        'getSettings',
        'checkForUpdates'
    ],
    recruitSteps: [
        'newRecruitIntro',
        'newRecruitXboxResponse',
        'newRecruitPsnResponse',
        'newRecruitSteamResponse',
        'newRecruitSteamUsernameResponse',
        'newRecruitMinecraft',
        'newRecruitWhoRecruited'
    ]
}

global.MESSAGE_PROCESSORS = [
    {
        subject: 'New Recruit Registration',
        body: 'Click the send button below to begin the registration process!',
        processor: 'newRecruitIntro'
    },
    {
        subject: 're: New Recruit Registration',
        processor: 'recruitDynamic'
    },
    {
        subject: 'delete-recruit',
        processor: 'deleteRecruit',
        allowedAuthors: [
            'kpkody'
        ]
    },
    {
        subject: 're: New Recruit \[',
        processor: 'recruitmentTeamResponse',
        allowedAuthors: [
            'kpkody',
            'jennifawennifa',
            'griff2621'
        ]
    }
]