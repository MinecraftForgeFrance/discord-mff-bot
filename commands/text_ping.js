const logger = require("../logger");
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run(client, messageUser, message) {
        if (message.channel.name === defaultConfig.channels.bots)
            message.channel.send({
                embed: {
                    color: 0xB9121B,
                    description: ":ping_pong: Pong: `" + `${Date.now() - message.createdTimestamp} ms` + "`"
                }
            }).catch(logger.error);
        else {
            const channel = client.channels.find(value => value.name === defaultConfig.channels.bots);
            message.channel.send(`Cette commande est seulement disponible dans le channel ${channel}`)
                .then(async (message) => logger.info(`Send message : ${message.content}`))
                .catch(logger.error);
        }
    },
    canRun() {
        return true;
    }
};
