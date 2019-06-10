const Discord = require('discord.js');
const jsonFile = require('jsonfile');
const request = require('request');
const logger = require("../logger");
const config = require('../config/config.js');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();

let attempt = 3;
let users = {
    data: {}
};

module.exports = {
    run(client, messageUser, message, args) {
        // Read file before process message
        let username = "";
        users = jsonFile.readFileSync("data/users.json");

        function saveUsersFile() {
            jsonFile.writeFile("data/users.json", users, {spaces: 4}, err => {
                if (err)
                    console.error(err);
                else
                    logger.info("This file has been saved");
            });
        }

        function pickRandomJavaQuestion(excludes) {
            let questionId;
            do {
                questionId = Math.random() * defaultConfig.javaQuestionsCount;
            } while(excludes.indexOf(questionId) !== -1)
            return questionId;
        }
        
        function sendJavaQuestion(question) {
            const embed = new Discord.RichEmbed({
                title: question.question,
                description: `Question ${users.data[messageUser].javaQuestionsInfo.answered.length + 1}/${defaultConfig.javaQuestionsCount}`
            });
            for(let i = 0; i < question.choices.length; i++) {
                embed.addField(`Réponse ${i}`, question.choices[i], false);
            }
            message.channel.send(embed)
            .then(async (message) => logger.info(`Send message : ${message.content}`))
            .catch(console.error);
        }

        const step = users.data[messageUser] ? users.data[messageUser].step : 0;

        if (args.length === 0)
        {
            message.channel.send(`Vous en êtes à l'étape **${step + 1}** sur 3 de votre enregistrement.`)
                            .then(async (message) => logger.info(`Send message : ${message.content}`))
                            .catch(console.error);
            switch(step) {
                case 0:
                    message.channel.send(`Vous devez utiliser la commande \`${defaultConfig.bot.prefix}register <pseudo>\` en remplaçant \`<pseudo>\` par votre pseudo sur le forum.`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(console.error);
                    break;
                case 1:
                    message.channel.send(`Vous devez utiliser la commande \`${defaultConfig.bot.prefix}register <code>\` en remplaçant \`<code>\` par le code reçu en MP sur le forum.`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(console.error);
                    break;
                case 2:
                    message.channel.send(`Vous devez utiliser la commande \`${defaultConfig.bot.prefix}register <réponse>\` en remplaçant \`<réponse>\` par le numéro de la bonne réponse.`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(console.error);
                    break;
            }
            return;
        }

        if (step === 0) {
            for (let i = 0; i < args.length; i++)
                username += (i === (args.length - 1)) ? args[i] : args[i] + " ";

            console.log(`username : ${username}`);
            // test username already use
            for (const user in users.data) {
                if (user.username === username) {
                    message.channel.send("Ce pseudo est déjà utilisé, veuillez contacter l'équipe de Minecraft Forge France s'il vous appartient.")
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                    return;
                }
            }

            // generate token and add user to file
            request({
                uri: `${defaultConfig["protocol"]}://${defaultConfig["hostname"]}:${defaultConfig["port"]}/discordapi/register`,
                method: "POST",
                json: {
                    username: username,
                    token: defaultConfig.token
                }
            }, (err, res, body) => {
                if (body.error === "User not found")
                    message.channel.send(":x: Votre pseudo n'existe pas ou n'est pas correct.")
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                else {
                    // save user infos
                    users.data[messageUser] = {
                        "username": username,
                        "token": body.result,
                        "step": 1,
                        "attempt": attempt
                    };
                    // save node
                    saveUsersFile()
                    logger.info(body.result);

                    message.channel.send(`:white_check_mark: Un code vient de vous être envoyé par mp, veuillez l'indiquer en réponse à ce message avec la commande \`${defaultConfig.bot.prefix}register \"code\"\`.`)
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                }
            });
        } else if (step === 1 && users.data[messageUser].attempt !== 0) {
            // wait for token
            if (args[0] !== users.data[messageUser].token) {
                users.data[messageUser].attempt--;
                if (users.data[messageUser].attempt === 0)
                    message.channel.send(":no_entry: **Code incorrect. Vous avez épuisé vos 3 essais.**\nVeuillez contacter l'équipe de Minecraft Forge France pour obtenir vos droits sur le Discord.")
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                else
                    message.channel.send(`:x: **Code incorrect, veuillez réessayer. **Nombre d\'essai restant : **${users.data[messageUser].attempt}**`)
                        .then(async (message) => logger.info(`Send message : ${message.content}`))
                        .catch(console.error);
                saveUsersFile()
            } else {
                message.channel.send(`:white_check_mark: **Code valide**. Répondez correctement à ${defaultConfig.javaQuestionsCount} questions pour finir votre enregistrement. Attention, vous n'avez pas le droit à l'erreur.`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(console.error);
                users.data[messageUser].step = 2;

                const questionId = pickRandomJavaQuestion([])
                const question = defaultConfig.javaQuestions[questionId];
                users.data[messageUser].javaQuestionsInfo = {
                    remainingQuestions: defaultConfig.javaQuestionsCount,
                    answered: [],
                    currentQuestionId: questionId,
                    answer: question.answer
                };

                saveUsersFile();

                sendJavaQuestion(question);

            }
        } else if(step == 2 && users.data[messageUser].javaQuestionsInfo.remainingQuestions > 0) {
            if(args[0] === users.data[messageUser].javaQuestionsInfo.answer) {
                // Good answer
                message.channel.send(`:white_check_mark: Bonne réponse !`)
                                .then(async (message) => logger.info(`Send message : ${message.content}`))
                                .catch(console.error);
                users.data[messageUser].javaQuestionsInfo.remainingQuestions--;
                users.data[messageUser].javaQuestionsInfo.answered.push(
                    users.data[messageUser].javaQuestionsInfo.currentQuestionId
                );

                if(users.data[messageUser].javaQuestionsInfo.remainingQuestions === 0) {
                    // Can become a member

                    users.data[messageUser].step = 3;

                    message.channel.send("**Bienvenue !** Prière de lire les règles du salon #regles sur le Discord.")

                    for (const guild of client.guilds) {
                        let role = guild[1].roles.find(value => value.name === defaultConfig.roles.roleMember);
                        let channel = guild[1].channels.find(value => value.name === defaultConfig.channels.logs);
                        guild[1].members.get(messageUser).addRole(role).then(() => logger.info(`${message.author.username} a le role ${defaultConfig.roles.roleMember}`)).catch(console.error);
                        channel.send(`**${message.author.username}** a rejoint le Discord.`)
                            .then(async (message) => logger.info(`Send message : ${message.content}`))
                            .catch(console.error);
                    }

                } else {
                    const questionId = pickRandomJavaQuestion(users.data[messageUser].javaQuestionsInfo.answered)
                    const question = defaultConfig.javaQuestions[questionId];
                    users.data[messageUser].javaQuestionsInfo.currentQuestionId = questionId;
                    users.data[messageUser].javaQuestionsInfo.answer = question.answser;

                    sendJavaQuestion(question);
                }

                saveUsersFile();

            } else {
                message.channel.send(":x: Mauvaise réponse. Vous n'avez donc pas le droit d'accèder au serveur.")
                                .then(async (message) => logger.info(`Send message : ${message.content}`))
                                .catch(console.error);
                // Wrong answser.
                user.data[messageUser].javaQuestionsInfo.remainingQuestions = -1;
                saveUsersFile();
                message.channel.send(":pill: Si vous avez eu un bug pendant l'enregistrement, n'hésitez pas à contacter un administrateur.")
                                .then(async (message) => logger.info(`Send message : ${message.content}`))
                                .catch(console.error);
            }
        }
    },
    canRun(client, messageUser) {
        // Read file before process message
        users = jsonFile.readFileSync("data/users.json");

        return !(typeof(users.data[messageUser]) === "object" && users.data[messageUser].step === 3);
    }
};
