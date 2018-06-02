const moment = require('moment');
const logger = require("../logger");
const jsonFile = require("jsonfile");

let banList = {
    data: []
};

module.exports = {
    run(client, messageUser, message, args) {
        if (args.length <= 1) {
            message.channel.send("- La syntaxe est `!ban @member <1m|1h|1d|1M|1Y> [reason]` pour bannir temporairement.\n" +
                "- La syntaxe est `!ban @member [reason]` pour bannir définitivemment.")
                .then(async (message) => logger.info(`Send message : ${message.content}`))
                .catch(logger.error);
        }
        else {
            banList = jsonFile.readFileSync("data/ban.json");
            let member = message.mentions.members.first();
            let time, reason;
            if (/^(\d+)([mhdMY])$/.test(args[1])) {
                time = /^(\d+)([mhdMY])$/.exec(args[1]); // optional
                moment.locale('fr');
                time = moment().add(time[1], time[2]);
                reason = message.content.split(/\s+/g).slice(3).join(" ");
                member.send(`Vous avez été banni du Discord pour la raison suivante : ${reason} et jusqu'au ${time.format('dddd D MMMM YYYY à HH:mm')}`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(logger.error);
                message.channel.send(`${member} a été banni jusqu'au ${time.format('dddd D MMMM YYYY à HH:mm')}.`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(logger.error);
            } else {
                reason = message.content.split(/\s+/g).slice(2).join(" ");
                time = 'def';
                member.send(`Vous avez été banni définitivement du Discord pour la raison suivante : ${reason}`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(logger.error);
                message.channel.send(`${member} a été banni définitivement.`)
                    .then(async (message) => logger.info(`Send message : ${message.content}`))
                    .catch(logger.error);
            }
            banList.data.push({
                dateNow: Date.now(),
                operator: messageUser,
                reason: reason,
                endBan: time.valueOf(),
                member: member.id
            });

            jsonFile.writeFile("data/ban.json", banList, {spaces: 4}, err => {
                if (err)
                    throw err;
                logger.info("This file has been saved");
            });

            member.ban(reason).catch(logger.error);
        }
    },
    canRun: (client, messageUser, message) => message.member.hasPermission("ADMINISTRATOR")
};
