const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message, args) => {
        if (message.channel.name === defaultConfig.channels.supportModding || message.channel.name === defaultConfig.channels.supportProgramming || message.channel.name === defaultConfig.channels.bots) {
            if (args.length === 0)
                message.channel.send("La syntaxe doit être `!support \<\on/off\>`.")
                    .then(async (message) => console.log(`Send message : ${message.content}`))
                    .catch(console.error());
            else {
                const role = message.guild.roles.find("name", defaultConfig.roles.roleSupport);
                if (args[0] === 'on') {
                    message.guild.members.get(messageUser).addRole(role).then(console.log(`${message.author.username} a le role ${defaultConfig.roles.roleSupport}`)).catch(console.error());
                }
                else if (args[0] === 'off') {
                    message.guild.members.get(messageUser).removeRole(role).then(console.log(`${message.author.username} n'a plus le role ${defaultConfig.roles.roleSupport}`)).catch(console.error());
                }
                else {
                    message.channel.send("La syntaxe doit être `!support \<\on/off\>`.").then(async (message) => console.log(`Send message : ${message.content}`)).catch(console.error());
                }
            }
        }
        else {
            let channels = [
                client.channels.find("name", defaultConfig.channels.supportModding),
                client.channels.find("name", defaultConfig.channels.supportProgramming),
                client.channels.find("name", defaultConfig.channels.bots)];
            message.channel.send(`Cette commande est seulement disponible dans les channels ${channels[0] + ", " + channels[1] + ", " + channels[2]}.`)
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());
        }
    },
    canRun: () => {
        return true;
    }
};