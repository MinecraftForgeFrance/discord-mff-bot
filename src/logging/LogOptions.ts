import { format, LoggerOptions, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const fileFormat = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

const consoleFormat = format.combine(fileFormat, format.colorize({ all: true }));

export const options: LoggerOptions = {
    transports: [
        new transports.Console({
            format: consoleFormat
        }),
        new DailyRotateFile({
            datePattern: 'YYYY-MM-DD',
            dirname: 'log/',
            filename: 'success_bot_%DATE%.log',
            format: fileFormat,
            maxSize: '20m',
            zippedArchive: true
        })
    ],
    exceptionHandlers: [
        new transports.Console({
            format: consoleFormat
        }),
        new DailyRotateFile({
            datePattern: 'YYYY-MM-DD',
            dirname: 'log/',
            filename: 'error_bot_%DATE%.log',
            format: fileFormat,
            maxSize: '20m',
            zippedArchive: true
        })
    ],
    exitOnError: false
};
