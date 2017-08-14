const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message) => {
        if (message.channel.name === defaultConfig.channels.bots)
            message.channel.send({
                embed: {
                    color: 0x03BEED,
                    description: ":ping_pong: Pong: `" + `${Date.now() - message.createdTimestamp} ms` + "`"
                }
            }).catch(console.error());
        else {
            const channel = client.channels.find("name", defaultConfig.channels.bots);
            message.channel.send(`Cette commande est seulement disponible dans le channel ${channel}`)
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());
        }
    },
    canRun: () => {
        return true;
    }
};