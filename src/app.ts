import Fastify from 'fastify';
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
import { initializeModHelpCommand } from './commands/ModHelpCommand.js';
import { initializeTutorialCommand } from './commands/TutorialCommand.js';
import { DiscAccess, UsersManager } from './users/UsersManager.js';

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

const usersManager = new UsersManager(new DiscAccess());

async function initializeCommands() {
    logger.info('Initializing dynamic command data...');
    try {
        await initializeTutorialCommand();
        await initializeModHelpCommand();
        logger.info('Dynamic command data initialized successfully.');
    }
    catch (error) {
        logger.error('Error during dynamic command initialization:', error);
    }
}

const rest = new REST().setToken(conf.get('application.token'));
try {
    await initializeCommands();
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
messageCreate(client, usersManager);

client.login(conf.get('application.token')).catch((err) => {
    logger.error('Unable to login to the application.');
    const token: string = conf.get('application.token');
    if (token.length === 0) {
        logger.error('The application token is empty. It\'s certainly the problem.');
    }
    logger.error(err);
    process.exit(1); // TODO: Extract error value
});

const fastify = Fastify({
  logger: true
});

fastify.post('/registration/callback', async (request, reply) => {
    // TODO: handle registration callback
    return { hello: 'world' };
});

// Run the server!
try {
    await fastify.listen({ port: 3000 });
}
catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
