import * as process from 'process';
import { createLogger, Logger } from 'winston';
import { Client, GatewayIntentBits, Partials, REST } from 'discord.js';
import { Routes } from 'discord-api-types/v10';

import ready from './listeners/ready.js';
import { conf } from './config/config.js';
import { options } from './logging/LogOptions.js';
import messageCreate from './listeners/messageCreate.js';
import interactionCreate from './listeners/interactionCreate.js';
import { GlobalCommands, GuildCommands } from './commands/Command.js';

export const logger: Logger = createLogger(options);
if (process.argv.indexOf('--debug') !== -1) {
    logger.level = 'debug';
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message]
});

const rest = new REST().setToken(conf.get('application.token'));
try {
    logger.info('Started refreshing application (/) commands.');
    await rest.put(
        Routes.applicationCommands(conf.get('application.clientId')),
        { body: GlobalCommands }
    );
    await rest.put(
        Routes.applicationGuildCommands(conf.get('application.clientId'), conf.get('application.guildId')),
        { body: GuildCommands }
    );
    logger.info('Successfully reloaded application (/) commands.');
}
catch (error) {
    logger.error(error);
}

ready(client);
interactionCreate(client);
messageCreate(client);

client.login(conf.get('application.token')).catch((err) => {
    logger.error('Unable to login to the application.');
    const token: string = conf.get('application.token');
    if (token.length === 0) {
        logger.error('The application token is empty. It\'s certainly the problem.');
    }
    logger.error(err);
    process.exit(1); // TODO: Extract error value
});
