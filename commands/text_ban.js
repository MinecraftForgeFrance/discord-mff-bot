const config = require('../config/config.js');
const moment = require('moment');
const defaultConfig = process.env.NODE_ENV === 'production' ? config.readConfig() : config.defaultConfig();
const jsonFile = require("jsonfile");

let banList = {
    data: {}
};

module.exports = {
    /*
    @command ban
    @param username

     */
    run: (client, messageUser, message, args) => {
        banList = jsonFile.readFileSync();
        let member = message.mentions.members.first();
        let time, reason;
        if (/^(\d+)([mhdMY])$/.test(args[1])) {
            time = /^(\d+)([mhdMY])$/.exec(args[1]); // optional
            moment.locale('fr');
            time = moment().add(time[1], time[2]);
            reason = message.content.split(/\s+/g).slice(3).join(" ");
            message.channel.send(`${member} a été banni jusqu'au ${time.format('dddd D MMMM YYYY à kk:mm')}.`)
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());
        } else {
            reason = message.content.split(/\s+/g).slice(2).join(" ");
            time = 'def';
            message.channel.send(`${member} a été banni définitivement.`)
                .then(async (message) => console.log(`Send message : ${message.content}`))
                .catch(console.error());
        }

        banList.data[member.id] = {
            dateNow: Date.now(),
            operator: messageUser,
            reason: reason,
            endBan: time
        };

        jsonFile.writeFile("data/ban.json", banList, {spaces: 4}, err => {
            if (err)
                throw err;
            console.log("This file has been saved");
        });
        member.ban(reason);
    },
    canRun: (client, messageUser, message) => {
        const role = message.guild.roles.find("name", defaultConfig.roles.roleAdmin);
        return !!(message.member.roles.has(role.id));
    }
};