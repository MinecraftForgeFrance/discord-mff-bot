// Modules
const Discord = require('discord.js');
const config = require("./config/config.js");
const request = require("request");
const schedule = require("node-schedule");
const jsonFile = require('jsonfile');
const fs = require("fs");

// Config
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();
const client = new Discord.Client();
//let userLastCommand = [];
let data = {
    oldDate: 0
};

client.on("ready", () => {
    console.log('I am ready!');
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
                console.log(`L'utilisateur ${ban.member} a de nouveau accès au Discord`);

                // Save file
                jsonFile.writeFile("data/ban.json", banList, {spaces: 4}, err => {
                    if (err)
                        throw err;
                    console.log("This file has been saved");
                });
            }
        });
        //readMessageFromShoutbox(now);
    });
});

client.on("message", message => {
    if (!message.author.bot) {
        let messageUser = message.author.id;
        //sendMessageToShoutbox(message, messageUser);
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
                        .catch(console.error);
                }
            } else {
                message.reply("la commande n'existe pas")
                    .then(async (message) => console.log(`Sent message: ${message.content}`))
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
        member.send(`Bonjour **${member.displayName}**,\nPour acquérir vos droits sur le Discord, merci de m'indiquer votre pseudo sur le forum à l'aide de la commande \`!register "pseudo"\`.`)
            .then(async (message) => console.log(`Sent message: ${message.content}`))
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
                console.log("This file has been saved");
            });
            console.log(`${member.displayName} a bien été supprimé.`);
        }
        const channel = client.channels.find(value => value.name === defaultConfig.channels.logs);
        channel.send(`**${member.displayName}** a quitté le Discord.`)
            .then(async (message) => console.log(`Sent message: ${message.content}`))
            .catch(console.error);
    }
});

function sendMessageToShoutbox(message, messageUser) {
    if (message.channel.name === defaultConfig.channels.shoutbox) {
        console.log(message.content);
        let users = jsonFile.readFileSync("data/users.json");
        data = jsonFile.readFileSync("data/data.json");
        if (typeof (users.data[messageUser]) === "object") {
            request(`${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path"]}?shoutbox&username=${users.data[messageUser].username}&content=${message.content}&date=${message.createdTimestamp}&token=k3K0DnQaQMemIDAGnVP6`, (err, res, body) => {
                if (err)
                    throw err;
                console.log(body);
            });
            data[message.id] = {
                timeStamp: message.createdTimestamp
            };
            jsonFile.writeFile("data/data.json", data, {spaces: 4}, err => {
                if (err)
                    throw err;
                console.log("This file has been saved");
            });
        }
        else {
            for (const guild of client.guilds) {
                guild[1].members.get(messageUser).send(`Merci de faire la commande \`!register\` en réponse à ce message pour pouvoir envoyer un message sur la shoutbox.`)
                    .then(message => console.log(`Send message: ${message.content}`)).catch(console.error);
            }
        }
    }
}

function readMessageFromShoutbox(newDate) {
    data = jsonFile.readFileSync("data/data.json");
    const channel = client.channels.find(value => value.name === defaultConfig.channels.shoutbox);
    channel.fetchMessages().then(messageCollection => {
        let i = 0;
        let messageArrayID = [];
        for (const message of messageCollection) {
            messageArrayID[i] = message[0];
            i++;
        }
        request({
            uri: `${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path"]}?shoutbox&oldDate=${data.oldDate}&newDate=${newDate}&token=k3K0DnQaQMemIDAGnVP6`,
            json: true
        }, (err, res, body) => {
            if (err)
                throw err;
            console.log(body);
            for (let k = 0; k < messageArrayID.length; k++) {
                for (let j = 0; j < body.username.length; j++) {
                    //if (typeof (data[messageArrayID[k]]) !== 'object' || (typeof (data[messageArrayID[k]]["timeStamp"]) === "number")) {
                    let datas = data[messageArrayID[k]];
                    console.log("typeof timestamp "  + (typeof (datas["timeStamp"])));
                    if (typeof (datas) === 'object' && typeof (datas["timeStamp"]) === "object")
                        console.log(datas["timeStamp"] !== body.date[j]);
                    else {
                        console.log("Nop");
                        /*if (typeof (body["modified"][j]) !== "string") {
                            console.log("Moi aussi 3");*/
                        /*channel.send(`\`${body.username[j]}\` : ${body.text[j]}`)
                            .then(async (message) => {
                                console.log(`Sent message: ${message.content}`);
                                data[message.id] = {
                                    timeStamp: message.createdTimestamp
                                };
                                jsonFile.writeFile("data/data.json", data, {spaces: 4}, err => {
                                    if (err)
                                        throw err;
                                    console.log("This file has been saved");
                                });
                            }).catch(console.error());*/
                        /*} else {

                        }*/
                        //}
                    }
                }
            }
            data = {oldDate: newDate};
            jsonFile.writeFile("data/data.json", data, {spaces: 4}, err => {
                if (err)
                    throw err;
                console.log("This file has been saved");
            });
        });
    });
}

function filterTimeMessage(message) {

}


client.login(defaultConfig.bot.token).catch(console.error);