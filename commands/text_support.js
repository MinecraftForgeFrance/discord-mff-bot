const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message, args) => {
        if (args.length === 0)
            message.channel.send("La commande est \`!support on\` ou \`!support off\`")
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());
        else {
            for (const guild of client.guilds) {
                const role = guild[1].roles.find("name", defaultConfig.roles.roleSupport);
                if (args[0] === 'on') {
                    if (guild[1].members.get(messageUser).roles.has(role)) {
                        message.channel.send("Vous avez déjà ce rôle.")
                            .then(async (message) => console.log(`Send message : ${message.content}`))
                            .catch(console.error());
                    }
                    else {
                        guild[1].members.get(messageUser).addRole(role).then(console.log(`${message.author.username} a le role ${defaultConfig.roles.roleSupport}`)).catch(console.error());
                    }
                }
                else if (args[0] === 'off') {
                    if (guild[1].members.get(messageUser).roles.has(role)) {
                        guild[1].members.get(messageUser).removeRole(role).then(console.log(`${message.author.username} n'a plus le role ${defaultConfig.roles.roleSupport}`)).catch(console.error());
                    }
                    else {
                        message.channel.send("Vous n'avez déjà plus ce rôle.")
                            .then(async (message) => console.log(`Send message : ${message.content}`))
                            .catch(console.error());
                    }
                }
                else {
                    message.channel.send("La commande est \`!support on\` ou \`!support off\`")
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                }
            }
        }
    },
    canRun: () => {
        return true;
    }
};