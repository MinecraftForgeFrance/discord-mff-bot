const Discord = require('discord.js');
const request = require('request');
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run: (client, messageUser, message, args) => {
        if (message.channel.name === defaultConfig.channels.supportModding || message.channel.name === defaultConfig.channels.bots) {
            if (args.length === 0)
                message.channel.send("La syntaxe doit être `!tutorial \<\sujet\>`")
                    .then(async (message) => console.log(`Send message : ${message.content}`))
                    .catch(console.error());
            else {
                let tutoname = "";
                for (let i = 0; i < args.length; i++)
                    tutoname += (i === (args.length - 1)) ? args[i] : args[i] + " ";

                request({
                    uri: `${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path"]}?tutoname=${tutoname}&token=k3K0DnQaQMemIDAGnVP6`,
                    json: true
                }, (err, res, body) => {
                    if (body === "Tutorial not found")
                        message.channel.send("Il n'existe aucun tutoriel avec ce sujet")
                            .then(async (message) => console.log(`Send message : ${message.content}`))
                            .catch(console.error());
                    else {
                        let embed = new Discord.RichEmbed();
                        embed.setColor(0x03BEED).setTitle("Liste des tutoriels correspondants à votre recherche : ");
                        embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");
                        let prefixArray = [];
                        let fieldContent = [];
                        for (let i = 0; i < body.prefix.length; i++) {
                            if (!prefixArray.includes(body.prefix[i])) {
                                prefixArray[i] = body.prefix[i];
                                fieldContent[i] = `- [${body.subject[i]}](${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path2"]}?tid=${body.tid[i]})`;
                            }
                            else {
                                fieldContent[prefixArray.indexOf(body.prefix[i])] += `\n- [${body.subject[i]}](${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path2"]}?tid=${body.tid[i]})`;
                            }
                        }

                        for (let i = 0; i < prefixArray.length; i++) {
                            embed.addField(prefixArray[i], fieldContent[i]);
                        }

                        message.channel.send({embed}).catch(console.error());
                    }
                });
            }
        }
        else {
            let channels = [
                client.channels.find("name", defaultConfig.channels.supportModding),
                client.channels.find("name", defaultConfig.channels.bots)];
            message.channel.send(`Cette commande est seulement disponible dans les channels ${channels[0] + ", " + channels[1]}.`)
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());
        }
    },
    canRun: () => {
        return true;
    }
};