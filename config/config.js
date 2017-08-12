const fs = require("fs");
const jsonFile = require('jsonfile');
const configFile = "config/config.json";
const config = {
    protocol: "http",
    hostname: "localhost",
    port: "80",
    path: "/mybb/inc/plugins/minecraftforgefrance.php",
    announcementChannel: "test",
    roles: {
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