const Discord = require('discord.js');
const request = require('request');
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message, args) => {
        if (args.length === 0)
            message.channel.send("La syntaxe doit être `!tutorial \<\sujet\>`")
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error);
        else {
            let tutorialName = "";
            for (let i = 0; i < args.length; i++)
                tutorialName += (i === (args.length - 1)) ? args[i] : args[i] + " ";

            request({
                uri: `${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path"]}?tutoname=${tutorialName}&token=k3K0DnQaQMemIDAGnVP6`,
                json: true
            }, (err, res, body) => {
                if (body === "Tutorial not found")
                    message.channel.send("Il n'existe aucun tutoriel avec ce sujet")
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error);
                else {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(0xBD8D46).setTitle("Liste des tutoriels correspondants à votre recherche : ");
                    embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");
                    let prefixArray = [];
                    let fieldContent = [];
                    if (typeof (body.prefix) !== "undefined") {
                        for (let i = 0, j = 0; i < body.prefix.length; i++) {
                            let field = `- [${body.subject[i]}](${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path2"]}?tid=${body.tid[i]})`;
                            if (!prefixArray.includes(body.prefix[i])) {
                                prefixArray[j] = body.prefix[i];
                                fieldContent[j] = field;
                                j++;
                            }
                            else {
                                if (fieldContent[prefixArray.lastIndexOf(body.prefix[i])].length <= (1024 - field.length)) {
                                    fieldContent[prefixArray.lastIndexOf(body.prefix[i])] += `\n${field}`;
                                }
                                else {
                                    prefixArray[j] = body.prefix[i];
                                    fieldContent[j] = field;
                                    j++;
                                }
                            }
                        }

                        if (prefixArray.length >= 25) {
                            message.reply("votre recherche renvoit trop de résultat, merci de l'affiner.")
                                .then(async (message) => console.log(`Send message : ${message.content}`))
                                .catch(console.error);
                        }
                        else {
                            for (let i = 0; i < prefixArray.length; i++) {
                                embed.addField(prefixArray[i], fieldContent[i]);
                            }
                            message.channel.send({embed}).catch(console.error);
                        }
                    }
                }
            });
        }
    },
    canRun: (client, messageUser, message) => {
        if (message.channel.name === defaultConfig.channels.supportModding || message.channel.name === defaultConfig.channels.bots) {
            return true;
        }
        else {
            let channels = [
                client.channels.find(value => value.name === defaultConfig.channels.supportModding),
                client.channels.find(value => value.name === defaultConfig.channels.bots)
            ];
            message.channel.send(`Cette commande est seulement disponible dans les channels ${channels[0] + ", " + channels[1]}.`)
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error);
        }
    }
};