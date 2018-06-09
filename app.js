// Modules
const Discord = require('discord.js');
const config = require("./config/config.js");
const request = require("request");
const schedule = require("node-schedule");
const jsonFile = require('jsonfile');
const fs = require("fs");
const logger = require("./logger");

// Config
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();
const client = new Discord.Client();
//let userLastCommand = [];

client.on("ready", () => {
    logger.info("I'm ready !");
    // Launch periodic tasks
    schedule.scheduleJob('*/30 * * * * *', function () {
        // read ban file
        let banList = jsonFile.readFileSync("data/ban.json");

        // get current date
        let now = Date.now();

        banList.data.forEach((ban) => {
            if (ban.endBan <= now) {
                for (const guild of client.guilds) {
                    guild[1].unban(ban.member).catch(console.error);
                }
                // remove file entry
                let index = banList.data.indexOf(ban);
                if (index > -1) {
                    banList.data.splice(index, 1);
                }
                logger.info(`L'utilisateur ${ban.member} a de nouveau accès au Discord`);

                // Save file
                jsonFile.writeFile("data/ban.json", banList, {spaces: 4}, err => {
                    if (err)
                        throw err;
                    logger.info("This file has been saved");
                });
            }
        });
    });
});

client.on("message", message => {
    if (!message.author.bot) {
        let messageUser = message.author.id;
        readShoutbox(message, messageUser);
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
                        .then(async (message) => logger.info(`Send message: ${message.content}`))
                        .catch(console.error);
                }
            } else {
                message.reply("la commande n'existe pas")
                    .then(async (message) => logger.info(`Send message: ${message.content}`))
                    .catch(console.error);
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
        member.send(`Bonjour **${member.displayName}**,\nPour acquérir vos droits sur le Discord, merci de m'indiquer votre pseudo sur le forum à l'aide de la commande \`!register pseudo\`.`)
            .then(async (message) => logger.info(`Send message: ${message.content}`))
            .catch(console.error);
});

client.on("guildMemberRemove", member => {
    if (!member.user.bot) {
        let users = jsonFile.readFileSync("data/users.json");
        if (typeof (users.data[member.id]) !== "undefined") {
            delete users.data[member.id];
            jsonFile.writeFile("data/users.json", users, {spaces: 4}, err => {
                if (err)
                    throw err;
                logger.info("This file has been saved");
            });
            logger.info(`${member.displayName} a bien été supprimé.`);
            const channel = client.channels.find(value => value.name === defaultConfig.channels.logs);
            channel.send(`**${member.displayName}** a quitté le Discord.`)
                .then(async (message) => logger.info(`Send message: ${message.content}`))
                .catch(console.error);
        }
    }
});


function readShoutbox(message, messageUser) {
    if (message.channel.name === defaultConfig.channels.shoutbox) {
        let users = jsonFile.readFileSync("data/users.json");
        if(typeof (users.data[messageUser]) !== "undefined") {
            let roles = message.mentions.roles;
            let members = message.mentions.members;
            let messageParse = message.content;
            if (messageParse.match(Discord.MessageMentions.ROLES_PATTERN) || messageParse.match(Discord.MessageMentions.USERS_PATTERN)) {
                roles.forEach((value) => {
                    messageParse = messageParse.replace(Discord.MessageMentions.ROLES_PATTERN, value.name);
                });
                members.forEach((value) => {
                    messageParse = messageParse.replace(Discord.MessageMentions.USERS_PATTERN, (users.data[value.id]) ? users.data[value.id].username : value.displayName);
                });
            }
            request({
                uri: `${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}/discordapi/sendshout`,
                method: "post",
                json: {
                    username: users.data[messageUser].username,
                    token: defaultConfig.token,
                    message: messageParse
                }
            }, (err, res, body) => {
                if (err) throw err;
            });
        }
        else {
            message.delete().then(async (message) => logger.info(`Message deleted with success`)).catch(console.error);
            message.author.send(`Bonjour **${message.author.username}**,\nPour pouvoir envoyer un message dans ce channel, merci de m'indiquer votre pseudo sur le forum à l'aide de la commande \`!register pseudo\`.`)
                .then(async (message) => logger.info(`Send message: ${message.content}`))
                .catch(console.error);
        }
    }
}

client.login(defaultConfig.bot.token).catch(console.error);
