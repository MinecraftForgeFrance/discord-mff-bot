// Modules
const Discord = require('discord.js');
const config = require("./config/config.js");
const schedule = require("node-schedule");
const jsonFile = require('jsonfile');
const fs = require("fs");

// Config
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();
const client = new Discord.Client();

//let userLastCommand = [];

client.on("ready", () => {
    console.log('I am ready!');
    // Launch periodic tasks
    schedule.scheduleJob('*/1 * * * *', function () {
        // read ban file
        let banList = jsonFile.readFileSync("data/ban.json");

        // get current date
        let now = Date.now();

        banList.data.forEach((ban) => {
            if (ban.endBan <= now) {
                for (const guild of client.guilds) {
                    guild[1].unban(ban.member);
                }
                // remove file entry
                let index = banList.data.indexOf(ban);
                if (index > -1) {
                    banList.data.splice(index, 1);
                }
                console.log(`L'utilisateur ${ban.member} à de nouveau accès au Discord`);

                // Save file
                jsonFile.writeFile("data/ban.json", banList, {spaces: 4}, err => {
                    if (err)
                        throw err;
                    console.log("This file has been saved");
                });
            }
        });
    });
});

client.on("messageUpdate", (oldMessage, newMessage) => {
    filterMessage(newMessage);
});

client.on("message", message => {
    if (!message.author.bot) {
        let messageUser = message.author.id;
        filterMessage(message);
        //if (message.content.indexOf('!') !== 0 && !(typeof(userLastCommand[messageUser]) === 'string')) return;
        if (message.content.indexOf(defaultConfig.bot.prefix) !== 0) return;
        // use user id instead of username
        //message.content = `!${userLastCommand[messageUser]} ${message.content}`;
        // This is the best way to define args. Trust me.
        const args = message.content.slice(defaultConfig.bot.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        //userLastCommand[messageUser] = command;
        // The list of if/else is replaced with those simple 2 lines:
        try {
            if (fs.existsSync(`./commands/${message.channel.type}_${command}.js`)) {

                let commandFile = require(`./commands/${message.channel.type}_${command}.js`);
                if (commandFile.canRun(client, messageUser, message)) { // and time between two command > 10s /// users[userID] = sendTime
                    commandFile.run(client, messageUser, message, args);
                }
                else {
                    message.reply("la commande ne peut pas s'exécuter")
                        .then(async (message) => console.log(`Sent message: ${message.content}`))
                        .catch(console.error());
                }
            } else {
                message.reply("la commande n'existe pas")
                    .then(async (message) => console.log(`Sent message: ${message.content}`))
                    .catch(console.error());
            }
            // send perm error
            // else
            // unknow command
        } catch (err) {
            console.error(err);
        }
    }
});

client.on("guildMemberAdd", member => {
    if (!member.user.bot)
        member.send(`Bonjour **${member.displayName}**,\nPour acquérir vos droits sur le Discord, merci de m'indiquer votre pseudo sur le forum à l'aide de la commande \`!register "pseudo"\`.`)
            .then(async (message) => console.log(`Sent message: ${message.content}`))
            .catch(console.error());
});

client.on("guildMemberRemove", member => {
    if (!member.user.bot) {
        let users = jsonFile.readFileSync("data/users.json");
        if (typeof (users.data[member.id]) !== "undefined") {
            delete users.data[member.id];
            jsonFile.writeFile("data/users.json", users, {spaces: 4}, err => {
                if (err)
                    throw err;
                console.log("This file has been saved");
            });
            console.log(`${member.displayName} a bien été supprimé.`);
        }
        const channel = client.channels.find("name", defaultConfig.channels.logs);
        channel.send(`**${member.displayName}** a quitté le Discord.`)
            .then(async (message) => console.log(`Sent message: ${message.content}`))
            .catch(console.error());
    }
});

function filterMessage(message) {
    if (message.channel.nsfw) {
        if (message.attachments.array().length !== 0 || message.embeds.length !== 0 || /(<)?http(s)?:\/\/(.*)\.(.*)(>)?/.test(message.content)) {
            message.delete()
                .then(async (message) => console.log(`Delete message: ${message.author}`))
                .catch(console.error());
            message.reply("merci de ne pas poster d'image ou de vidéo dans ce channel sous peine de sanction")
                .then(async (message) => console.log(`Sent message: ${message.content}`))
                .catch(console.error());
        }
    }
}

function filterTimeMessage(message) {

}


client.login(defaultConfig.bot.token);