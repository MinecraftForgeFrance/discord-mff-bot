const Discord = require('discord.js');
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

module.exports = {
    run(client, messageUser, message) {
        let channels = [defaultConfig.channels.supportModding, defaultConfig.channels.supportProgramming, defaultConfig.channels.bots];
        let embed = new Discord.RichEmbed();
        embed.setColor(0x03BEED).setTitle("Voici les commandes disponibles : ");
        embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");

        embed.addField("support", "Cette commande attribue le rôle " + `${defaultConfig.roles.roleSupport} uniquement si vous êtes dans les channels ${channels[0] + ", " + channels[1] + ", " + channels[2]}.\n` +
            "- La syntaxe doit être `!support \<\on\/off\>`.");
        embed.addField("ping", "Cette commande est uniquement disponible si vous êtes dans le channel " + `${channels[2]}.\n` +
            "- La syntaxe est `!ping`.");
        embed.addField("tutorial", "Cette commande est uniquement disponible dans les channels " + `${channels[0] + ", " + channels[2]}.\n` +
            "- La syntaxe est `!tutorial [-v\<\mcversion\>] \<\sujet\>`.");
        embed.addField("modhelp", "Cette commande est uniquement disponible dans les channels " + `${channels[0] + ", " + channels[2]}.\n` +
            "- La syntaxe est `!modhelp [-v\<\mcversion\>] \<\sujet\>`.");

        if (message.member.hasPermission("ADMINISTRATOR")) {
            embed.addField("ban", "Cette commande permet de bannir temporairement ou définitivement.\n" +
                "- La syntaxe est `!ban @member <1m|1h|1d|1M|1Y> [reason]` pour bannir temporairement.\n" +
                "- La syntaxe est `!ban @member [reason]` pour bannir définitivemment.");
        }

        message.channel.send({embed}).catch(console.error);
    },
    canRun() {
        return true;
    }
};
