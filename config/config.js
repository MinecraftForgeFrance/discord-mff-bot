const fs = require("fs");
const jsonFile = require('jsonfile');
const configFile = "config/config.json";
const config = {
    protocol: "http",
    hostname: "node.wolfdev.fr",
    port: "80",
    token: "***REMOVED***",//"***REMOVED***",//"***REMOVED***",
    channels: {
        logs: "logs-io",
        supportModding: "aide-modding",
        supportProgramming: "aide-programmation",
        bots: "bots",
        shoutbox: "shoutbox"
    },
    bot: {
        prefix: "!",
        token: "***REMOVED***" //"***REMOVED***"
    },
    roles: {
        roleMember: "Membre",
        roleSupport: "Support"
    },
    javaQuestions: [
        {
            question: "La réponse à cette question est la réponse C",
            choices: [
                "La réponse A",
                "La réponse B",
                "La réponse C",
                "La réponse D"
            ],
            answser: 0
        },
        {
            question: "La réponse à cette question est la réponse A",
            choices: [
                "La réponse A",
                "La réponse B",
                "La réponse C"
            ],
            answer: 2
        }
    ],
    javaQuestionsCount: 2
};

module.exports = {
    defaultConfig: () => {
        if (!fs.existsSync(configFile)) {
            jsonFile.writeFile(configFile, config, {spaces: 4}, err => {
                if (err)
                    throw err;
                console.log("Default config is generated");
            });
        }
        return config;

    },
    readConfig: () => {
        let config = jsonFile.readFileSync(configFile);
        if(config.javaQuestions.length < config.javaQuestionsCount)
            config.javaQuestionsCount = config.javaQuestions.length
        return config
    }
};
