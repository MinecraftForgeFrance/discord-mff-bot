const fs = require("fs");
const jsonFile = require('jsonfile');
const configFile = "config/config.json";
const config = {
    protocol: "http",
    hostname: "localhost",
    port: "80",
    path: "/mybb/discord2mff.php",
    path2: "/mybb/showthread.php",
    token: "***REMOVED***",
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
        roleAdmin: "Admin",
        roleMember: "Membre",
        roleSupport: "Support"
    }
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
        return jsonFile.readFileSync(configFile);
    }
};