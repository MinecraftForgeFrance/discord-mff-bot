const config = require("../config/config.js");
const Discord = require("discord.js");
const request = require("request");
const logger = require("../logger");

const defaultConfig = process.env.NODE_ENV === "production" ? config.readConfig() : config.defaultConfig();

module.exports = {
    run(client, messageUser, message, args) {
        if (args.length === 0) {
            message.channel.send("La syntaxe doit être `!events \<\eventName\>`")
                .then(async (message) => logger.info(`Send message : ${message}`))
                .catch(console.error);
        }
        else {
            let eventName = "";

            for (let i = 0; i < args.length; i++) {
                eventName += (i === (args.length - 1)) ? args[i] : args[i] + " ";
            }

            let url = `${defaultConfig.protocol}://${defaultConfig.hostname}:${defaultConfig.port}`;
            request({
                uri: `${url}/discordapi/forgeevents?term=${eventName}`,
                json: true
            }, (err, res, body) => {
                if (body.message === "No result") {
                    message.channel.send("Il n'existe aucun event avec ce nom")
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                }
                else {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(0xBD8D46).setTitle("Liste des events correspondants à votre recherche : ");
                    embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");

                    let fieldTitle = [];
                    let fieldContent = [];
                    for (let key of Object.keys(body)) {
                        let packageEvent = body[key].package;
                        let descriptionEvent = (body[key].description.length >= 512 - 5) ? `${body[key].description.substring(0, 512 - 5)} (...)` : `${body[key].description}`;
                        let urlAnchorEvent = `${url}/forgeevents#${body[key].anchors}`;
                        fieldTitle.push(key);
                        fieldContent.push(`- **Package** : \`${packageEvent}\`\n${(descriptionEvent) ? `- **Description** : ${descriptionEvent}\n` : ""} [Pour plus d'info](${urlAnchorEvent})`);
                    }
                    let embedSize = embed.title.length;
                    for (let i = 0; i < fieldTitle.length; i++) {
                        embedSize += fieldTitle[i].length + fieldContent[i].length;
                    }

                    if (fieldTitle.length > 25 || embedSize >= 6000) {
                        message.reply("votre recherche renvoie trop de résultat, merci de l'affiner.")
                            .then(async (message) => logger.info(`Send message : ${message.content}`))
                            .catch(console.error);
                    }
                    else {
                        for (let i = 0; i < fieldTitle.length; i++) {
                            embed.addField(fieldTitle[i], fieldContent[i]);
                        }
                        message.channel.send({embed}).catch(console.error);
                    }
                }
            });
        }
    },
    canRun(client, messageUser, message) {
        if (message.channel.name === defaultConfig.channels.supportModding || message.channel.name === defaultConfig.channels.bots) {
            return true;
        }
        else {
            let channels = [
                client.channels.find(value => value.name === defaultConfig.channels.supportModding),
                client.channels.find(value => value.name === defaultConfig.channels.bots)
            ];
            message.channel.send(`Cette commande est seulement disponible dans les channels ${channels[0] + ", " + channels[1]}.`)
                .then(async (message) => logger.info(`Send message : ${message.content}`))
                .catch(console.error);
            return false;
        }
    }
};
