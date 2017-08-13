const jsonFile = require('jsonfile');
const request = require('request');
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

let username = "";
let attempt = 3;
let users = {
    data: {}
};

module.exports = {
    run: (client, messageUser, message, args) => {
        // Read file before process message
        users = jsonFile.readFileSync("data/users.json");
        if (args.length === 0)
            message.channel.send(":x: Vous avez oublié d'indiqué votre pseudo.")
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());

        if (args.length !== 0 && (typeof(users.data[messageUser]) === "undefined" || (typeof(users.data[messageUser]) === "object" && users.data[messageUser].step === 0))) {
            username = args[0];
            console.log(`username : ${username}`);
            // test username already use
            for (const user in users.data) {
                if (user.username === username) {
                    message.channel.send("Ce pseudo est déjà utilisé, veuillez contacter l'équipe de Minecraft Forge France s'il vous appartient.")
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                    return;
                }
            }

            // generate token and add user to file
            request(`${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}${defaultConfig["path"]}?username=${username}&token=k3K0DnQaQMemIDAGnVP6`, (err, res, body) => {
                if (body === "User not found")
                    message.channel.send(":x: Votre pseudo n'existe pas ou n'est pas correct.")
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                else {
                    // save user infos
                    users.data[messageUser] = {
                        "username": username,
                        "token": body,
                        "step": 1,
                        "attempt": attempt
                    };
                    // save node
                    jsonFile.writeFile("data/users.json", users, {spaces: 4}, err => {
                        if (err)
                            throw err;
                        console.log("This file has been saved");
                    });
                    console.log(body);

                    message.channel.send(":white_check_mark: Un code vient de vous être envoyé par mp, veuillez l'indiquer en réponse à ce message avec la commande \`!register \"code\"\`.")
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                }
            });
        } else if (users.data[messageUser].step === 1 && users.data[messageUser].attempt !== 0) {
            // wait for token
            if (args[0] !== users.data[messageUser].token) {
                users.data[messageUser].attempt--;
                if (users.data[messageUser].attempt === 0)
                    message.channel.send(":no_entry: **Code incorrect. Vous avez épuisé vos 3 essais.**\nVeuillez contacter l'équipe de Minecraft Forge France pour obtenir vos droits sur le Discord.")
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                else
                    message.channel.send(`:x: **Code incorrect, veuillez réessayer. **Nombre d\'essai restant : **${users.data[messageUser].attempt}**`)
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                jsonFile.writeFile("data/users.json", users, {spaces: 4}, err => {
                    if (err)
                        throw err;
                    console.log("This file has been saved");
                });
            } else {
                message.channel.send(":white_check_mark: **Code valide. Bienvenue !**\nPrière de lire les règles du salon #regles sur le Discord.")
                    .then(async (message) => console.log(`Send message : ${message.content}`))
                    .catch(console.error());
                users.data[messageUser].step = 2;
                // save node
                jsonFile.writeFile("data/users.json", users, {spaces: 4}, err => {
                    if (err)
                        throw err;
                    console.log("This file has been saved");
                });

                for (const guild of client.guilds) {
                    let role = guild[1].roles.find("name", defaultConfig.roles.roleMember);
                    let channel = guild[1].channels.find("name", defaultConfig.announcementChannel);
                    guild[1].members.get(messageUser).addRole(role).then(console.log(`${message.author.username} a le role ${defaultConfig.roles.roleMember}`)).catch(console.error());
                    channel.send(`**${message.author.username}** a rejoint le Discord.`)
                        .then(async (message) => console.log(`Send message : ${message.content}`))
                        .catch(console.error());
                }
            }
        }
    },
    canRun: (client, messageUser) => {
        // Read file before process message
        users = jsonFile.readFileSync("data/users.json");

        if (typeof(users.data[messageUser]) === "object" && users.data[messageUser].step === 2)
            return false;
        else
            return true;
    }
};