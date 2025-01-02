import Conf from "conf";
import { createLogger, Logger } from "winston";
import { BotConfig, schema } from "./config/config.js";
import { options } from "./logging/LogOptions.js";
import { Client, GatewayIntentBits, REST } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { GlobalCommands, GuildCommands } from "./commands/Command.js";

import * as process from "process";
import ready from "./listeners/ready.js";
import interactionCreate from "./listeners/interactionCreate.js";

export const logger: Logger = createLogger(options);
if (process.argv.indexOf("--debug") !== -1) {
    logger.level = "debug";
}

export const conf = new Conf<BotConfig>({
    configName: "bot-config",
    cwd: "./config",
    schema
});

const client = new Client({intents: [GatewayIntentBits.Guilds]});

const rest = new REST({ version: "10" }).setToken(conf.get("application.token"));
try {
    logger.info("Started refreshing application (/) commands.");
    await rest.put(
        Routes.applicationCommands(conf.get("application.clientId")),
        {body: GlobalCommands}
    );
    await rest.put(
        Routes.applicationGuildCommands(conf.get("application.clientId"), conf.get("application.guildId")),
        {body: GuildCommands}
    );
    logger.info('Successfully reloaded application (/) commands.');
} catch (error) {
    logger.error(error);
}

ready(client);
interactionCreate(client);

client.login(conf.get("application.token")).catch((err) => {
    logger.error("Unable to login to the application.");
    const token: string = conf.get("application.token");
    if (token.length === 0) {
        logger.error("The application token is empty. It's certainly the problem.");
    }
    logger.error(err);
    process.exit(1); // TODO: Extract error value
});
