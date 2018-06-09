const moment = require("moment");
const fs = require("fs");
const winston = require("winston");
require("winston-daily-rotate-file");

const logDirectory = "log/";

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            timestamp() {
                moment.locale("fr");
                return moment().format("YYYY-MM-DD HH:mm:ss");
            },
            formatter(options) {
                return options.timestamp() + ' - [' +
                    winston.config.colorize(options.level, options.level.toUpperCase()) + ']: ' +
                    (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }
        }),
        new winston.transports.DailyRotateFile({
            timestamp() {
                moment.locale("fr");
                return moment().format("YYYY-MM-DD HH:mm:ss");
            },
            formatter(options) {
                return options.timestamp() + ' - [' + options.level.toUpperCase() + ']: ' +
                    (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            },
            dirname: logDirectory,
            filename: "success_bot_%DATE%.log",
            datePattern: "YYYYMMDD",
            zippedArchive: true,
            maxSize: "20m"
        })
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            timestamp() {
                moment.locale("fr");
                return moment().format("YYYY-MM-DD HH:mm:ss");
            },
            formatter(options) {
                return options.timestamp() + ' - [' +
                    winston.config.colorize(options.level, options.level.toUpperCase()) + ']: ' +
                    (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }
        }),
        new winston.transports.DailyRotateFile({
            timestamp() {
                moment.locale("fr");
                return moment().format("YYYY-MM-DD HH:mm:ss");
            },
            formatter(options) {
                return options.timestamp() + ' - [' + options.level.toUpperCase() + ']: ' +
                    (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            },
            dirname: logDirectory,
            filename: "error_bot_%DATE%.log",
            datePattern: "YYYYMMDD",
            zippedArchive: true,
            maxSize: "20m"
        })
    ],
    exitOnError: false
});

module.exports = logger;
