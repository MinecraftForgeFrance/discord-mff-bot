const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message, args) => {
        for (const guild of client.guilds) {
            const role = guild[1].roles.find("name", defaultConfig.roles.roleSupport);
            if (args[0] === 'on')
                guild[1].members.get(messageUser).addRole(role).then(console.log(`${message.author.username} a le role ${defaultConfig.roles.roleSupport}`)).catch(console.error());
            else if (args[0] === 'off')
                guild[1].members.get(messageUser).removeRole(role).then(console.log(`${message.author.username} n'a plus le role ${defaultConfig.roles.roleSupport}`)).catch(console.error());
        }
    },
    canRun: () => {
        return true;
    }
};