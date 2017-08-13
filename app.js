const Discord = require('discord.js');
const config = require("./config/config.js");
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();
const client = new Discord.Client();
const token = '***REMOVED***';

//let userLastCommand = [];
client.on("ready", () => {
    console.log('I am ready!');
});

client.on("message", message => {
    if (!message.author.bot) {
        let messageUser = message.author.id;

        //if (message.content.indexOf('!') !== 0 && !(typeof(userLastCommand[messageUser]) === 'string')) return;
        if (message.content.indexOf('!') !== 0) return;
        // use user id instead of username
            //message.content = `!${userLastCommand[messageUser]} ${message.content}`;
        // This is the best way to define args. Trust me.
        const args = message.content.slice(1).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        //userLastCommand[messageUser] = command;
        // The list of if/else is replaced with those simple 2 lines:
        try {
            let commandFile = require(`./commands/${message.channel.type}_${command}.js`);
            if (commandFile.canRun(client, messageUser)) {
                commandFile.run(client, messageUser, message, args);
            }
        } catch (err) {
            console.error(err);
        }
    }
});

client.on("guildMemberAdd", member => {
    member.send(`Bonjour **${member.displayName}**,\nPour acquérir vos droits sur le Discord, merci de m'indiquer votre pseudo sur le forum à l'aide de la commande \`!register "pseudo"\`.`)
        .then(async (message) => console.log(`Sent message: ${message.content}`))
        .catch(console.error());
});

client.on("guildMemberRemove", member => {
    const channel = client.channels.find("name", defaultConfig.announcementChannel);
    channel.send(`**${member.displayName}** a quitté le Discord.`)
        .then(async (message) => console.log(`Sent message: ${message.content}`))
        .catch(console.error());
});

client.login(token);