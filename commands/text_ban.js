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
        let member = message.mentions.members.first();
        let time, reason;
        if (/^(\d)+([mhdMY])$/.test(args[1])) {
            time = /^(\d)+([mhdMY])$/.exec(args[1]); // optional
            let year = 0, month = 0, day = 0, hour = 0, minute = 0;
            switch (time[2]) {
                case 'm':
                    // m > h > d > M > Y
                    minute = time[1] % 60;
                    hour = time[1] / 60;
                    day = hour / 24;
                    hour %= 24;
                    month = day / 30;
                    day %= 30;
                    year = month / 12;
                    month %= 12;
                    break;
                case 'h':
                    // h > d > M > Y
                    hour = time[1] % 24;
                    day = time[1] / 24;
                    month = day / 30;
                    day %= 30;
                    year = month / 12;
                    month %= 12;
                    break;
                case 'd':
                    // d > M > Y
                    day = time[1] % 30;
                    month = time[1] / 30;
                    year = month / 12;
                    month %= 12;
                    break;
                case 'M':
                    month = time[1] % 12;
                    year = time[1] / 12;
                    break;
                case 'Y':
                    year = time[1];
                    break;
            }
            time = moment().add(minute, 'm').add(hour, 'h').add(day, 'd').add(month, 'M').add(year, 'Y');
            reason = message.content.split(/\s+/g).slice(3).join(" ");
            console.log('ban temp: ' + time.toString());
        } else {
            time = "def";
            reason = message.content.split(/\s+/g).slice(2).join(" ");
            console.log('ban def!');
        }

// !ban @isador <1m|1h|1d|1M|1Y> [reason]
    },
    canRun: (client, messageUser, message) => {
        const role = message.guild.roles.find("name", defaultConfig.roles.roleAdmin);
        return !!(message.member.roles.has(role.id));
    }
};