const Discord = require('discord.js');
const request = require('request');
const logger = require("../logger");
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run(client, messageUser, message, args) {
        if (args.length === 0)
            message.channel.send("La syntaxe doit être `!tutorial [-v\<\mcversion>\] \<\sujet\>`")
                .then(async (message) => logger.info(`Send message : ${message.content}`))
                .catch(console.error);
        else {
            let tutorialName = "";
            let tutorialVersion = "";
            let beginTutorialName = 0;
            if (args[0].startsWith("-v")) {
                tutorialVersion = args[0].substring(args[0].indexOf("-v") + 2);
                beginTutorialName = 1;
            }
            for (let i = beginTutorialName; i < args.length; i++)
                tutorialName += (i === (args.length - 1)) ? args[i] : args[i] + " ";

            request({
                uri: `${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}/discordapi/tutorial?term=${tutorialName}${(args[0].startsWith("-v")) ? `&hasTags[]=${tutorialVersion}` : ''}&token=${defaultConfig["token"]}`,
                json: true
            }, (err, res, body) => {
                if (body.message === "No result")
                    message.channel.send("Il n'existe aucun tutoriel avec ce sujet")
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                else {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(0xBD8D46).setTitle("Liste des tutoriels correspondants à votre recherche : ");
                    embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");
                    let prefixArray = [];
                    let fieldContent = [];
                    for (let key of Object.keys(body)) {
                        for (let i = 0; i < body[key].length; i++) {
                            let field = `- [${body[key][i].title}](${body[key][i].url})`;
                            if (!prefixArray.includes(key)) {
                                prefixArray.push(key);
                                fieldContent.push(field);
                            }
                            else {
                                if (fieldContent[prefixArray.lastIndexOf(key)].length <= (1024 - field.length)) {
                                    fieldContent[prefixArray.lastIndexOf(key)] += `\n${field}`;
                                }
                                else {
                                    prefixArray.push(key);
                                    fieldContent.push(field);
                                }
                            }
                        }
                    }

                    let embedSize = embed.title.length;
                    for (let i = 0; i < prefixArray.length; i++) {
                        embedSize += prefixArray[i].length + fieldContent[i].length;
                    }

                    if (prefixArray.length >= 25 || embedSize >= 6000) {
                        message.reply("votre recherche renvoie trop de résultat, merci de l'affiner.")
                            .then(async (message) => logger.info(`Send message : ${message.content}`))
                            .catch(console.error);
                    }
                    else {
                        for (let i = 0; i < prefixArray.length; i++) {
                            embed.addField(prefixArray[i], fieldContent[i]);
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
        }
    }
};
