const logger = require("../logger");
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run(client, messageUser, message, args) {
        if (message.channel.name === defaultConfig.channels.supportModding || message.channel.name === defaultConfig.channels.supportProgramming || message.channel.name === defaultConfig.channels.bots) {
            if (args.length === 0)
                message.channel.send("La syntaxe doit être `!support \<\on/off\>`.")
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(err => logger.error(err));
            else {
                const role = message.guild.roles.find(value => value.name === defaultConfig.roles.roleSupport);
                if (args[0] === 'on') {
                    message.guild.members.get(messageUser).addRole(role).then(() => logger.info(`${message.author.username} a le role ${defaultConfig.roles.roleSupport}`)).catch(err => logger.error(err));
                }
                else if (args[0] === 'off') {
                    message.guild.members.get(messageUser).removeRole(role).then(() => logger.info(`${message.author.username} n'a plus le role ${defaultConfig.roles.roleSupport}`)).catch(err => logger.error(err));
                }
                else {
                    message.channel.send("La syntaxe doit être `!support \<\on/off\>`.").then(async (message) => logger.info(`Send message : ${message.content}`)).catch(err => logger.error(err));
                }
            }
        }
        else {
            let channels = [
                client.channels.find(value => value.name === defaultConfig.channels.supportModding),
                client.channels.find(value => value.name === defaultConfig.channels.supportProgramming),
                client.channels.find(value => value.name === defaultConfig.channels.bots)];
            message.channel.send(`Cette commande est seulement disponible dans les channels ${channels[0] + ", " + channels[1] + ", " + channels[2]}.`)
                .then(async (message) => logger.info(`Send message : ${message.content}`))
                .catch(err => logger.error(err));
        }
    },
    canRun() {
        return true;
    }
};
