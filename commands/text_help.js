const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message) => {
        let channels = [defaultConfig.channels.supportModding, defaultConfig.channels.supportProgramming, defaultConfig.channels.bots];
        message.channel.send({
            embed: {
                color: 0x03BEED,
                title: "Voici les commandes disponibles : ",
                fields: [
                    {
                        name: "support",
                        value: "Cette commande attribue le rôle " + `${defaultConfig.roles.roleSupport} uniquement si vous êtes dans les channels ${channels[0] + ", " + channels[1] + ", " + channels[2]}.\n` +
                        "La syntaxe doit être `!support \<\on\/off\>`."
                    },
                    {
                        name: "ping",
                        value: "Cette commande est uniquement disponible si vous êtes dans le channel " + `${channels[2]}.\n` +
                        "La syntaxe est `!ping`."
                    }
                ]
            }
        }).catch(console.error());
    },
    canRun: () => {
        return true;
    }
};